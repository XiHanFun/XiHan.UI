// 会话状态容器：把事件流收敛成"一组消息 + 一个状态"，订阅式、零框架依赖。
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
  /** 瞬态通道：transient data 只走这里，不进 parts、不污染历史。 */
  readonly onData?: (name: string, data: unknown) => void
  readonly generateId?: () => string
  readonly frame?: FrameBatcherOptions
}

export interface ThreadStore {
  getSnapshot: () => ThreadSnapshot
  /** 订阅式、无框架。返回退订函数。 */
  subscribe: (fn: (snapshot: ThreadSnapshot) => void) => Cleanup
  /** 追加一条 user 消息并发起一次运行；已有运行在跑时先 stop。 */
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
  // 不引 uuid：store 内唯一就够了，跨端唯一的 id 由服务端的 message-start 覆盖进来
  const nextId = options.generateId ?? ((): string => `xh-msg-${++seq}`)

  // 快照对象在两次发布之间保持同一个引用，框架层才能靠引用比对判断"变没变"
  let current: ThreadSnapshot = { messages, status, error }

  const publish = (): void => {
    if (disposed)
      return
    current = { messages, status, error }
    // 先拷贝再遍历：回调里退订是常态
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
    // 收尾事件要带时间戳，但本包承诺整条管道不读时钟，所以借用最后一帧的
    let lastReceivedTime = 0
    try {
      for await (const ev of options.transport.stream(req, ac.signal)) {
        lastReceivedTime = ev.receivedTime
        // 本轮已被 stop / 新一轮 submit 顶掉，剩下的事件不再落盘
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

        // 错误不中断消费：后端可能在 error 之后还补 finish 与结算信息
        if (ev.kind === 'error') {
          error = ev.errorText
          status = 'error'
        }

        batcher.schedule()
      }
    }
    catch (err) {
      // transport 契约上不会抛，这里兜的是 onData 之类宿主回调里漏出来的异常：
      // 与其变成一条无人处理的 rejection，不如落进 error 让用户看见
      error = String(err)
      status = 'error'
    }
    finally {
      // 三条路都不会有 finish/abort 进 reducer：stop 顶掉本轮（上面直接 return）、
      // 服务端不发终止帧直接关流、中途异常。不补的话 TextPart.streaming 永远停在 true、
      // 工具永远停在 input-streaming，而且会随下一次请求原样上行给后端。
      // 这段要放在 controller === ac 判定之外：被顶掉的陈旧轮次同样得收尾，
      // 而那时它的消息未必还是数组最后一条，只能按 id 回写
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
        // 陈旧轮次：状态归新一轮管，但收尾后的消息得发出去
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
    // 先置位再 stop：stop 内部的结算会走 publish，晚一步就等于朝正在拆卸的宿主再发一次快照。
    // 置位后 publish 自己会短路，abort 与状态收尾照常发生。
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
