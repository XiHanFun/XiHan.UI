/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 会话状态容器：把事件流收敛成一棵消息树与一个运行状态，对外提供当前路径的快照与订阅。
import type { Cleanup } from '@xihan-ui/core'
import type { ChatRequest, ChatTrigger, MessageContent, UIMessage } from '../model/message'
import type { UIMessagePart } from '../model/part-kinds'
import type { ReduceState } from '../reduce/parts-reducer'
import type { Transport } from '../transport/transport'
import type { FrameBatcherOptions } from './throttle'
import { createReduceState, reduceEvent } from '../reduce/parts-reducer'
import { createFrameBatcher } from './throttle'

export type ThreadStatus = 'idle' | 'submitted' | 'streaming' | 'error'

/** 一条消息在同一父消息下的兄弟里排第几。 */
export interface ThreadBranch {
  /** 0 基位置，按创建先后排。 */
  readonly index: number
  /** 兄弟总数（含自己）；1 表示这一处没有分支。 */
  readonly count: number
}

export interface ThreadSnapshot {
  /** 当前路径：从会话第一条往下，每个分叉取选中的那一支。 */
  readonly messages: readonly UIMessage[]
  readonly status: ThreadStatus
  readonly error?: string
  /** 当前路径上每条消息的分支位置，按消息 id 取。 */
  readonly branches: Readonly<Record<string, ThreadBranch>>
}

export interface ThreadStoreOptions {
  readonly transport: Transport
  /** 瞬态 data 帧的回调，这类帧不进 parts。 */
  readonly onData?: (name: string, data: unknown) => void
  readonly generateId?: () => string
  readonly frame?: FrameBatcherOptions
  /**
   * 起始消息，用于恢复一段已有的会话。可以是线性历史（不写 parentId，按数组顺序相连），
   * 也可以是 getTree() 导出的整棵树；每个分叉缺省选中最后创建的那一支。
   */
  readonly messages?: readonly UIMessage[]
}

/** 发起运行的方法都接受的附加项。 */
export interface ThreadRunExtra {
  /** 宿主自定义字段，整体并进这一次的请求体。 */
  readonly body?: Readonly<Record<string, unknown>>
}

export interface ThreadStore {
  getSnapshot: () => ThreadSnapshot
  /** 订阅快照变化，返回退订函数。 */
  subscribe: (fn: (snapshot: ThreadSnapshot) => void) => Cleanup
  /**
   * 在当前路径末尾追加一条 user 消息并发起一次运行，已有运行会先被取消。
   * 内容可以是纯文本，也可以是带附件的 parts（text / file / data）。
   */
  submit: (content: MessageContent, extra?: ThreadRunExtra) => void
  /**
   * 重新生成一条助手回复：在同一条提问下再要一条候选，新回复成为那一处的另一个分支并被选中，
   * 原来的回复留在树里可以切回。缺省针对当前路径上最后一条助手消息。
   */
  regenerate: (messageId?: string, extra?: ThreadRunExtra) => void
  /**
   * 重试失败的运行：失败的那条助手消息从树里撤掉（失败不算候选），从它的父消息重新发起；
   * 运行在第一帧之前就失败、还没有助手消息时，从当前路径的最后一条提问重新发起。
   * 当前没有失败的运行时抛错。
   */
  retry: (extra?: ThreadRunExtra) => void
  /**
   * 改写一条用户消息后重发：新内容作为原消息的兄弟插在同一位置并被选中，
   * 原消息连同它下面的回复留作另一个分支。
   */
  edit: (messageId: string, content: MessageContent, extra?: ThreadRunExtra) => void
  /**
   * 续写一条被截断的助手消息：新产出接在它原有 parts 之后，截断在半句上的正文接着长。
   * 只接受当前路径的最后一条，且它被 stop 截断（status 为 aborted）或因长度上限收尾
   * （metadata.finishReason 为 length）。缺省针对当前路径的最后一条。
   */
  continue: (messageId?: string, extra?: ThreadRunExtra) => void
  /** 在某条消息所在的那组兄弟里切到第 index 条（0 基）；其下沿用那一支上次选中的路径。 */
  selectBranch: (messageId: string, index: number) => void
  /** 取消当前运行，保留已产出的 parts；被截断的助手消息记为 aborted，可以续写。 */
  stop: () => void
  /** 清空全部消息与错误，并取消进行中的运行。 */
  clear: () => void
  /** 整棵消息树，按创建先后排，每条带 parentId；可交回 messages 选项恢复会话。 */
  getTree: () => readonly UIMessage[]
  dispose: () => void
}

/** 一次运行的计划：请求上下文、新回复挂在谁下面、是否在已有消息上续写。 */
interface RunPlan {
  readonly history: readonly UIMessage[]
  readonly parentId: string | null
  readonly trigger: ChatTrigger
  readonly messageId?: string
  /** 续写的目标；为空则新建一条助手消息。 */
  readonly resume?: UIMessage
  readonly body?: Readonly<Record<string, unknown>>
}

/** 用户消息允许的内容块：正文、附件与结构化数据。 */
const USER_PART_TYPES: ReadonlySet<UIMessagePart['type']> = new Set(['text', 'file', 'data'])

function toParts(content: MessageContent): readonly UIMessagePart[] {
  if (typeof content === 'string')
    return [{ type: 'text', text: content }]
  for (const part of content) {
    if (!USER_PART_TYPES.has(part.type))
      throw new Error(`[xh] chat-stream: 用户消息只能包含 text / file / data 块，收到 ${part.type}`)
  }
  return content
}

export function createThreadStore(options: ThreadStoreOptions): ThreadStore {
  /** 全部消息，Map 的插入顺序即创建顺序。 */
  let nodes = new Map<string, UIMessage>()
  /** 父消息 id（根为 null）到子消息 id 列表，按创建先后排。 */
  let children = new Map<string | null, string[]>()
  /** 每个分叉当前选中的那一支；缺席时取最后创建的一支。 */
  let selected = new Map<string | null, string>()

  let status: ThreadStatus = 'idle'
  let error: string | undefined
  let controller: AbortController | null = null
  /** 各轮运行收尾在途消息的办法：stop 当场收尾，不等传输那头真的停下。 */
  const closers = new Map<AbortController, () => void>()
  let disposed = false
  let seq = 0

  const listeners = new Set<(snapshot: ThreadSnapshot) => void>()
  // 默认 id 只保证 store 内唯一，服务端的 message-start 会覆盖它
  const nextId = options.generateId ?? ((): string => `xh-msg-${++seq}`)

  const siblingsOf = (parentId: string | null): readonly string[] => children.get(parentId) ?? []

  const parentOf = (id: string): string | null => nodes.get(id)?.parentId ?? null

  /** 挂一条新消息到树上并选中它。 */
  const attach = (message: UIMessage & { readonly parentId: string | null }): void => {
    nodes.set(message.id, message)
    const list = children.get(message.parentId)
    if (list === undefined)
      children.set(message.parentId, [message.id])
    else
      list.push(message.id)
    selected.set(message.parentId, message.id)
  }

  /** 从树上摘掉一条没有子消息的消息。 */
  const detach = (id: string): void => {
    const parentId = parentOf(id)
    nodes.delete(id)
    const list = siblingsOf(parentId).filter(sibling => sibling !== id)
    if (list.length === 0)
      children.delete(parentId)
    else
      children.set(parentId, list)
    if (selected.get(parentId) === id)
      selected.delete(parentId)
    children.delete(id)
    selected.delete(id)
  }

  /** 服务端的 message-start 换了本地 id：树上各处引用一并改名。 */
  const rename = (from: string, to: string): void => {
    if (from === to)
      return
    if (nodes.has(to))
      throw new Error(`[xh] chat-stream: 服务端下发的消息 id ${to} 与会话里已有的消息重复`)
    const message = nodes.get(from)
    if (message === undefined)
      return
    // 保住插入顺序：按原顺序重建一遍
    nodes = new Map([...nodes].map(([id, value]) => (id === from ? [to, { ...value, id: to }] : [id, value])))
    const parentId = message.parentId ?? null
    children.set(parentId, siblingsOf(parentId).map(id => (id === from ? to : id)))
    if (selected.get(parentId) === from)
      selected.set(parentId, to)
    const own = children.get(from)
    if (own !== undefined) {
      children.delete(from)
      children.set(to, own)
      for (const child of own) {
        const value = nodes.get(child)
        if (value !== undefined)
          nodes.set(child, { ...value, parentId: to })
      }
    }
    const pick = selected.get(from)
    if (pick !== undefined) {
      selected.delete(from)
      selected.set(to, pick)
    }
  }

  /** 当前路径：从根往下，每层取选中的那一支。 */
  const activePath = (): UIMessage[] => {
    const path: UIMessage[] = []
    let parentId: string | null = null
    while (true) {
      const list = siblingsOf(parentId)
      if (list.length === 0)
        return path
      const pick = selected.get(parentId)
      const id = pick !== undefined && list.includes(pick) ? pick : list[list.length - 1]!
      const message = nodes.get(id)
      if (message === undefined)
        return path
      path.push(message)
      parentId = id
    }
  }

  /** 当前路径上到 id 为止（含）的那一段；id 不在路径上返回 null。 */
  const pathTo = (id: string | null): UIMessage[] | null => {
    if (id === null)
      return []
    const path = activePath()
    const at = path.findIndex(message => message.id === id)
    return at === -1 ? null : path.slice(0, at + 1)
  }

  const branchesOf = (path: readonly UIMessage[]): Record<string, ThreadBranch> => {
    const out: Record<string, ThreadBranch> = {}
    for (const message of path) {
      const list = siblingsOf(message.parentId ?? null)
      out[message.id] = { index: list.indexOf(message.id), count: list.length }
    }
    return out
  }

  const snapshotOf = (): ThreadSnapshot => {
    const messages = activePath()
    return { messages, status, error, branches: branchesOf(messages) }
  }

  // 快照对象在两次发布之间保持同一引用，供宿主做引用比对
  let current: ThreadSnapshot

  const publish = (): void => {
    if (disposed)
      return
    current = snapshotOf()
    // 回调内可以退订：Set 遍历中删掉当前项不影响其余
    for (const fn of listeners) fn(current)
  }

  const batcher = createFrameBatcher(publish, options.frame)

  const settle = (next: ThreadStatus): void => {
    status = next
    batcher.cancel()
    publish()
  }

  const hydrate = (initial: readonly UIMessage[]): void => {
    let previous: string | null = null
    for (const message of initial) {
      const parentId = message.parentId === undefined ? previous : message.parentId
      if (nodes.has(message.id))
        throw new Error(`[xh] chat-stream: 起始消息里的 id ${message.id} 重复`)
      if (parentId !== null && !nodes.has(parentId))
        throw new Error(`[xh] chat-stream: 起始消息 ${message.id} 的 parentId ${parentId} 不在它之前`)
      attach({ ...message, parentId })
      previous = message.id
    }
  }

  if (options.messages !== undefined)
    hydrate(options.messages)
  current = snapshotOf()

  const stop = (): void => {
    const running = controller
    if (running === null)
      return
    controller = null
    running.abort()
    // 截断的消息当场记为 aborted：紧接着的 continue 不必等传输那头真的关流
    closers.get(running)?.()
    if (status === 'submitted' || status === 'streaming')
      settle('idle')
  }

  const run = async (plan: RunPlan, ac: AbortController): Promise<void> => {
    let pending: ReduceState | null = null
    let pendingId: string | null = null
    // 收尾事件的时间戳沿用最后一帧的 receivedTime
    let lastReceivedTime = 0

    /** 把归约出的消息写回树上；服务端改了 id 时先改名。 */
    const store = (state: ReduceState): void => {
      const message = state.message
      if (pendingId !== null && pendingId !== message.id)
        rename(pendingId, message.id)
      pendingId = message.id
      if (nodes.has(message.id))
        nodes.set(message.id, { ...message, parentId: plan.parentId })
    }

    /** 收尾在途的消息，只做一次。 */
    const close = (): void => {
      if (pending === null)
        return
      let closed = reduceEvent(pending, { kind: 'abort', receivedTime: lastReceivedTime })
      // 宿主回调抛出的失败没有 error 事件，这里补记结束方式
      if (controller === ac && status === 'error' && closed.message.status !== 'error')
        closed = { ...closed, message: { ...closed.message, status: 'error' } }
      store(closed)
      pending = null
    }
    closers.set(ac, close)

    const request: ChatRequest = {
      messages: plan.history,
      body: plan.body,
      trigger: plan.trigger,
      messageId: plan.messageId,
    }

    try {
      for await (const ev of options.transport.stream(request, ac.signal)) {
        lastReceivedTime = ev.receivedTime
        // 本轮已被 stop 或新一轮运行顶掉，剩余事件不再写入
        if (controller !== ac)
          return

        if (ev.kind === 'data' && ev.transient) {
          options.onData?.(ev.name, ev.data)
          continue
        }
        // 续写是在已有消息上接着长，服务端这一轮的起始帧不能把它换成另一条
        if (ev.kind === 'message-start' && plan.resume !== undefined)
          continue

        if (pending === null) {
          status = 'streaming'
          if (plan.resume === undefined) {
            pending = createReduceState(nextId(), 'assistant')
            attach({ ...pending.message, parentId: plan.parentId })
          }
          else {
            pending = createReduceState(plan.resume.id, 'assistant', plan.resume)
          }
          pendingId = pending.message.id
        }

        pending = reduceEvent(pending, ev)
        store(pending)

        // 记录错误但继续消费后续事件
        if (ev.kind === 'error') {
          error = ev.errorText
          status = 'error'
        }

        batcher.schedule()
      }
    }
    catch (err) {
      // 本轮已被 stop 或新一轮顶掉：传输在取消时抛出的异常不算这一轮的失败，也不能改写当前状态
      if (controller !== ac)
        return
      // 兜住宿主回调抛出的异常，落进 error 状态
      error = String(err)
      status = 'error'
    }
    finally {
      // 无论本轮是否被顶掉都补一次收尾，并按 id 回写（此时消息未必在当前路径的末尾）
      close()
      closers.delete(ac)
      if (controller === ac) {
        controller = null
        settle(status === 'error' ? 'error' : 'idle')
      }
      else {
        // 已被顶掉的轮次不改状态，只发布收尾后的消息
        publish()
      }
    }
  }

  /** 发起一次运行：先取消进行中的一轮，清掉上一轮的错误。 */
  const start = (plan: RunPlan): void => {
    error = undefined
    status = 'submitted'
    batcher.cancel()
    publish()

    const ac = new AbortController()
    controller = ac
    void run(plan, ac)
  }

  const lastOfPath = (): UIMessage | undefined => activePath().at(-1)

  /** 取一条助手消息，不存在或不是助手消息时抛错。 */
  const assistantAt = (messageId: string | undefined, action: string): UIMessage => {
    const target = messageId === undefined
      ? activePath().reverse().find(message => message.role === 'assistant')
      : nodes.get(messageId)
    if (target === undefined)
      throw new Error(`[xh] chat-stream: ${action}找不到目标助手消息${messageId === undefined ? '' : ` ${messageId}`}`)
    if (target.role !== 'assistant')
      throw new Error(`[xh] chat-stream: ${action}只针对助手消息，${target.id} 是 ${target.role}`)
    return target
  }

  const submit = (content: MessageContent, extra?: ThreadRunExtra): void => {
    if (disposed)
      return
    const parts = toParts(content)
    stop()
    const parentId = lastOfPath()?.id ?? null
    const message = { id: nextId(), role: 'user' as const, parts, parentId }
    attach(message)
    start({ history: pathTo(message.id)!, parentId: message.id, trigger: 'submit', body: extra?.body })
  }

  const regenerate = (messageId?: string, extra?: ThreadRunExtra): void => {
    if (disposed)
      return
    stop()
    const target = assistantAt(messageId, '重新生成')
    const parentId = target.parentId ?? null
    const history = pathTo(parentId)
    if (history === null)
      throw new Error(`[xh] chat-stream: 重新生成的消息 ${target.id} 不在当前路径上`)
    start({ history, parentId, trigger: 'regenerate', messageId: target.id, body: extra?.body })
  }

  const retry = (extra?: ThreadRunExtra): void => {
    if (disposed)
      return
    stop()
    const last = lastOfPath()
    if (last?.role === 'assistant' && last.status === 'error') {
      const parentId = last.parentId ?? null
      detach(last.id)
      start({ history: pathTo(parentId)!, parentId, trigger: 'retry', messageId: last.id, body: extra?.body })
      return
    }
    // 第一帧之前就失败：还没有助手消息，从最后一条提问重新发起
    if (status === 'error' && last?.role === 'user') {
      start({ history: pathTo(last.id)!, parentId: last.id, trigger: 'retry', body: extra?.body })
      return
    }
    throw new Error('[xh] chat-stream: 当前没有可以重试的失败运行')
  }

  const edit = (messageId: string, content: MessageContent, extra?: ThreadRunExtra): void => {
    if (disposed)
      return
    const target = nodes.get(messageId)
    if (target === undefined)
      throw new Error(`[xh] chat-stream: 编辑找不到消息 ${messageId}`)
    if (target.role !== 'user')
      throw new Error(`[xh] chat-stream: 编辑只针对用户消息，${messageId} 是 ${target.role}`)
    const parts = toParts(content)
    stop()
    const parentId = target.parentId ?? null
    if (pathTo(parentId) === null)
      throw new Error(`[xh] chat-stream: 编辑的消息 ${messageId} 不在当前路径上`)
    const message = { id: nextId(), role: 'user' as const, parts, parentId }
    attach(message)
    start({ history: pathTo(message.id)!, parentId: message.id, trigger: 'edit', messageId, body: extra?.body })
  }

  const resume = (messageId?: string, extra?: ThreadRunExtra): void => {
    if (disposed)
      return
    stop()
    const target = assistantAt(messageId ?? lastOfPath()?.id, '续写')
    if (lastOfPath()?.id !== target.id)
      throw new Error(`[xh] chat-stream: 只能续写当前路径的最后一条，${target.id} 不是`)
    const truncated = target.status === 'aborted' || target.metadata?.finishReason === 'length'
    if (!truncated)
      throw new Error(`[xh] chat-stream: 消息 ${target.id} 没有被截断，不能续写`)
    start({
      history: pathTo(target.id)!,
      parentId: target.parentId ?? null,
      trigger: 'continue',
      messageId: target.id,
      resume: target,
      body: extra?.body,
    })
  }

  const selectBranch = (messageId: string, index: number): void => {
    if (disposed)
      return
    const target = nodes.get(messageId)
    if (target === undefined)
      throw new Error(`[xh] chat-stream: 切换分支找不到消息 ${messageId}`)
    const parentId = target.parentId ?? null
    const list = siblingsOf(parentId)
    if (!Number.isInteger(index) || index < 0 || index >= list.length)
      throw new Error(`[xh] chat-stream: 分支下标 ${index} 越界，这一处共 ${list.length} 支`)
    if (selected.get(parentId) === list[index])
      return
    selected.set(parentId, list[index]!)
    batcher.cancel()
    publish()
  }

  const clear = (): void => {
    if (disposed)
      return
    stop()
    nodes = new Map()
    children = new Map()
    selected = new Map()
    error = undefined
    settle('idle')
  }

  const dispose = (): void => {
    if (disposed)
      return
    // 先置位再 stop，让 stop 内部的 publish 短路
    disposed = true
    stop()
    batcher.cancel()
    listeners.clear()
  }

  return {
    getSnapshot: (): ThreadSnapshot => current,
    subscribe: (fn: (snapshot: ThreadSnapshot) => void): Cleanup => {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },
    submit,
    regenerate,
    retry,
    edit,
    continue: resume,
    selectBranch,
    stop,
    clear,
    getTree: () => [...nodes.values()],
    dispose,
  }
}
