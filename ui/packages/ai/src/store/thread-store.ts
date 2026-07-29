// 会话状态容器：把事件流收敛成一组消息与一个运行状态，对外提供订阅。
import type { Cleanup } from '@xihan-ui/core'
import type { ChatRequest, UIMessage } from '../model/message'
import type { ReduceState } from '../reduce/parts-reducer'
import type { Transport } from '../transport/transport'
import type { FrameBatcherOptions } from './throttle'
import { createReduceState, reduceEvent } from '../reduce/parts-reducer'
import { createFrameBatcher } from './throttle'

export type ThreadStatus = 'idle' | 'submitted' | 'streaming' | 'error'

export interface ThreadSnapshot {
  readonly messages: readonly UIMessage[]
  readonly status: ThreadStatus
  readonly error?: string
}

export interface ThreadStoreOptions {
  readonly transport: Transport
  /** 瞬态 data 帧的回调，这类帧不进 parts。 */
  readonly onData?: (name: string, data: unknown) => void
  readonly generateId?: () => string
  readonly frame?: FrameBatcherOptions
}

export interface ThreadStore {
  getSnapshot: () => ThreadSnapshot
  /** 订阅快照变化，返回退订函数。 */
  subscribe: (fn: (snapshot: ThreadSnapshot) => void) => Cleanup
  /** 追加一条 user 消息并发起一次运行，已有运行会先被取消。 */
  submit: (text: string, extra?: { readonly body?: Readonly<Record<string, unknown>> }) => void
  /** 取消当前运行，保留已产出的 parts。 */
  stop: () => void
  /** 清空全部消息与错误，并取消进行中的运行。 */
  clear: () => void
  dispose: () => void
}

export function createThreadStore(options: ThreadStoreOptions): ThreadStore {
  let messages: readonly UIMessage[] = []
  let status: ThreadStatus = 'idle'
  let error: string | undefined
  let controller: AbortController | null = null
  let disposed = false
  let seq = 0

  const listeners = new Set<(snapshot: ThreadSnapshot) => void>()
  // 默认 id 只保证 store 内唯一，服务端的 message-start 会覆盖它
  const nextId = options.generateId ?? ((): string => `xh-msg-${++seq}`)

  // 快照对象在两次发布之间保持同一引用，供宿主做引用比对
  let current: ThreadSnapshot = { messages, status, error }

  const publish = (): void => {
    if (disposed)
      return
    current = { messages, status, error }
    // 先拷贝再遍历，允许回调内退订
    for (const fn of [...listeners]) fn(current)
  }

  const batcher = createFrameBatcher(publish, options.frame)

  const settle = (next: ThreadStatus): void => {
    status = next
    batcher.cancel()
    publish()
  }

  const stop = (): void => {
    const running = controller
    if (running === null)
      return
    controller = null
    running.abort()
    if (status === 'submitted' || status === 'streaming')
      settle('idle')
  }

  const run = async (req: ChatRequest, ac: AbortController): Promise<void> => {
    let pending: ReduceState | null = null
    // 收尾事件的时间戳沿用最后一帧的 receivedTime
    let lastReceivedTime = 0
    try {
      for await (const ev of options.transport.stream(req, ac.signal)) {
        lastReceivedTime = ev.receivedTime
        // 本轮已被 stop 或新一轮 submit 顶掉，剩余事件不再写入
        if (controller !== ac)
          return

        if (ev.kind === 'data' && ev.transient) {
          options.onData?.(ev.name, ev.data)
          continue
        }

        if (pending === null) {
          status = 'streaming'
          pending = createReduceState(nextId(), 'assistant')
          messages = [...messages, pending.message]
        }

        pending = reduceEvent(pending, ev)
        messages = [...messages.slice(0, -1), pending.message]

        // 记录错误但继续消费后续事件
        if (ev.kind === 'error') {
          error = ev.errorText
          status = 'error'
        }

        batcher.schedule()
      }
    }
    catch (err) {
      // 兜住宿主回调抛出的异常，落进 error 状态
      error = String(err)
      status = 'error'
    }
    finally {
      // 无论本轮是否被顶掉都补一次收尾，并按 id 回写（此时消息未必是数组最后一条）
      if (pending !== null) {
        const closed = reduceEvent(pending, { kind: 'abort', receivedTime: lastReceivedTime }).message
        messages = messages.map(m => (m.id === closed.id ? closed : m))
        pending = null
      }
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

  const submit = (text: string, extra?: { readonly body?: Readonly<Record<string, unknown>> }): void => {
    if (disposed)
      return
    stop()
    error = undefined
    messages = [...messages, { id: nextId(), role: 'user', parts: [{ type: 'text', text }] }]
    status = 'submitted'
    batcher.cancel()
    publish()

    const ac = new AbortController()
    controller = ac
    void run({ messages, body: extra?.body }, ac)
  }

  const clear = (): void => {
    if (disposed)
      return
    stop()
    messages = []
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
    stop,
    clear,
    dispose,
  }
}
