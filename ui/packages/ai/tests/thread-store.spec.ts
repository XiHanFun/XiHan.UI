import type { TextPart } from '../src/model/part-kinds'
import type { NormalizedEvent } from '../src/reduce/events'
import type { ThreadSnapshot } from '../src/store/thread-store'
import type { Transport } from '../src/transport/transport'
import { describe, expect, it, vi } from 'vitest'
import { asBlockKey } from '../src/reduce/events'
import { createThreadStore } from '../src/store/thread-store'

const T = 1000

/** 让出微任务队列，等 store 内部的 for await 推进一轮。 */
function tick(): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

/** 手动驱动的帧调度：不跑 run()，批处理里的发布就不会发生。 */
function manualFrames(): {
  options: { requestFrame: (fn: () => void) => number, cancelFrame: (handle: number) => void }
  run: () => void
  pending: () => number
} {
  let queue: { handle: number, fn: () => void }[] = []
  let seq = 0
  return {
    options: {
      requestFrame: (fn) => {
        const handle = ++seq
        queue.push({ handle, fn })
        return handle
      },
      cancelFrame: (handle) => {
        queue = queue.filter(item => item.handle !== handle)
      },
    },
    run: () => {
      const batch = queue
      queue = []
      for (const item of batch) item.fn()
    },
    pending: () => queue.length,
  }
}

interface Run {
  push: (ev: NormalizedEvent) => void
  close: () => void
  readonly signal: AbortSignal
}

/**
 * 由测试逐个投喂事件的传输，模拟真实的"边到边处理"。
 * 每次 stream() 都开一条独立的通道：共用一个缓冲区的话，被顶掉的旧轮次与新轮次会抢同一批事件，
 * 测出来的就不是 store 的行为而是假传输的行为。
 */
function channelTransport(): { transport: Transport, runs: Run[], latest: () => Run } {
  const runs: Run[] = []

  const transport: Transport = {
    stream: (_req, signal) => {
      const buffer: NormalizedEvent[] = []
      let wake: (() => void) | null = null
      let closed = false
      const bump = (): void => {
        wake?.()
        wake = null
      }
      runs.push({
        signal,
        push: (ev) => {
          buffer.push(ev)
          bump()
        },
        close: () => {
          closed = true
          bump()
        },
      })
      return {
        async* [Symbol.asyncIterator]() {
          while (true) {
            if (buffer.length > 0) {
              yield buffer.shift()!
              continue
            }
            if (closed)
              return
            await new Promise<void>((resolve) => {
              wake = resolve
            })
          }
        },
      }
    },
  }

  return { transport, runs, latest: () => runs.at(-1)! }
}

const textStart = (id: string): NormalizedEvent => ({ kind: 'text-start', block: asBlockKey(id), receivedTime: T })
function textDelta(id: string, delta: string): NormalizedEvent {
  return { kind: 'text-delta', block: asBlockKey(id), delta, receivedTime: T }
}

describe('createThreadStore 提交与状态流转', () => {
  it('submit 追加 user 消息，status 依次 submitted → streaming → idle', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })
    const seen: string[] = []
    store.subscribe(s => seen.push(s.status))

    store.submit('你好')
    expect(seen).toEqual(['submitted'])
    expect(store.getSnapshot().messages).toEqual([
      { id: 'xh-msg-1', role: 'user', parts: [{ type: 'text', text: '你好' }] },
    ])

    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '在'))
    await tick()
    frames.run()
    expect(seen).toEqual(['submitted', 'streaming'])

    chan.latest().close()
    await tick()
    expect(seen).toEqual(['submitted', 'streaming', 'idle'])
    expect(store.getSnapshot().status).toBe('idle')
  })

  it('服务端不发终止帧直接关流，开着的块照样被收尾', async () => {
    // 这条最容易被漏：状态一路走到 idle 看着挺正常，但 TextPart.streaming 还停在 true，
    // 界面永远顶着生长态光标，而且这份 parts 会原样上行给下一次请求
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })

    store.submit('你好')
    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '半句'))
    chan.latest().close()
    await tick()
    frames.run()

    const part = store.getSnapshot().messages[1]!.parts[0] as TextPart
    expect(part.text).toBe('半句')
    expect(part.streaming).toBe(false)
    expect(store.getSnapshot().status).toBe('idle')
  })

  it('助手消息随增量生长，收尾后内容完整', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })

    store.submit('你好')
    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '你'))
    chan.latest().push(textDelta('b1', '好'))
    chan.latest().push({ kind: 'finish', receivedTime: T })
    chan.latest().close()
    await tick()
    frames.run()

    const { messages } = store.getSnapshot()
    expect(messages).toHaveLength(2)
    expect(messages[1]!.role).toBe('assistant')
    expect((messages[1]!.parts[0] as TextPart).text).toBe('你好')
    expect((messages[1]!.parts[0] as TextPart).streaming).toBe(false)
  })

  it('generateId 可注入；服务端 message-start 会覆盖本地 id', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    let n = 0
    const store = createThreadStore({
      transport: chan.transport,
      frame: frames.options,
      generateId: () => `id-${++n}`,
    })

    store.submit('你好')
    expect(store.getSnapshot().messages[0]!.id).toBe('id-1')

    chan.latest().push({ kind: 'message-start', messageId: 'server-77', role: 'assistant', receivedTime: T })
    chan.latest().close()
    await tick()
    expect(store.getSnapshot().messages[1]!.id).toBe('server-77')
  })
})

describe('createThreadStore 瞬态数据', () => {
  it('transient data 只进 onData，不进 parts', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const onData = vi.fn()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options, onData })

    store.submit('你好')
    chan.latest().push({ kind: 'data', name: 'progress', data: { pct: 30 }, transient: true, receivedTime: T })
    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '好'))
    chan.latest().close()
    await tick()
    frames.run()

    expect(onData).toHaveBeenCalledExactlyOnceWith('progress', { pct: 30 })
    const parts = store.getSnapshot().messages[1]!.parts
    expect(parts.some(p => p.type === 'data')).toBe(false)
  })

  it('非瞬态 data 进 parts 且不走 onData', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const onData = vi.fn()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options, onData })

    store.submit('你好')
    chan.latest().push({ kind: 'data', name: 'chart', data: [1, 2], transient: false, receivedTime: T })
    chan.latest().close()
    await tick()

    expect(onData).not.toHaveBeenCalled()
    expect(store.getSnapshot().messages[1]!.parts).toEqual([{ type: 'data', name: 'chart', data: [1, 2] }])
  })

  it('瞬态事件不会凭空造出助手消息之外的东西：它照样开启本轮消息', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options, onData: () => {} })

    store.submit('你好')
    chan.latest().push({ kind: 'data', name: 'ping', data: 1, transient: true, receivedTime: T })
    chan.latest().close()
    await tick()

    // 全程只有瞬态帧 → 没有任何 part 落盘，助手消息也就不该被创建
    expect(store.getSnapshot().messages).toHaveLength(1)
  })
})

describe('createThreadStore 错误与取消', () => {
  it('error 事件把 status 打成 error 并留住已产出的 parts', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })

    store.submit('你好')
    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '已经写了一半'))
    chan.latest().push({ kind: 'error', errorText: '模型过载', retryable: true, receivedTime: T })
    chan.latest().close()
    await tick()
    frames.run()

    const snapshot = store.getSnapshot()
    expect(snapshot.status).toBe('error')
    expect(snapshot.error).toBe('模型过载')
    expect((snapshot.messages[1]!.parts[0] as TextPart).text).toBe('已经写了一半')
  })

  it('stop 后陈旧轮次不再落盘，但开着的块要被收尾', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })
    const listener = vi.fn()
    store.subscribe(listener)

    store.submit('你好')
    chan.latest().push(textStart('b1'))
    await tick()
    frames.run()
    const before = listener.mock.calls.length

    store.stop()
    expect(store.getSnapshot().status).toBe('idle')
    const afterStop = listener.mock.calls.length
    expect(afterStop).toBe(before + 1)

    // 停下那一刻 b1 还开着。传输还在往外吐，但本轮已被顶掉：内容一律不落盘
    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).streaming).toBe(true)
    chan.latest().push(textDelta('b1', '不该出现'))
    chan.latest().push({ kind: 'finish', receivedTime: T })
    chan.latest().close()
    await tick()
    frames.run()

    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).text).toBe('')
    // 但开着的块必须被收尾并发出去：留着 streaming=true 的话，用户按了停止，
    // 界面上那条消息会永远顶着生长态光标，而且原样上行给下一次请求
    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).streaming).toBe(false)
    expect(listener.mock.calls.length).toBe(afterStop + 1)
  })

  it('stop 会 abort 掉传输拿到的 signal', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })

    store.submit('你好')
    await tick()
    expect(chan.latest().signal.aborted).toBe(false)
    store.stop()
    expect(chan.latest().signal.aborted).toBe(true)
  })

  it('新一轮 submit 顶掉上一轮，旧轮次的后续事件不再落盘', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })

    store.submit('第一问')
    const firstRun = chan.runs[0]!
    firstRun.push(textStart('b1'))
    await tick()

    store.submit('第二问')
    expect(chan.runs).toHaveLength(2)
    expect(firstRun.signal.aborted).toBe(true)

    // 旧轮次还在往外吐（服务端还没反应过来），这些事件一个都不该落盘
    firstRun.push(textDelta('b1', '旧的'))
    firstRun.push({ kind: 'finish', receivedTime: T })
    firstRun.close()
    await tick()
    frames.run()

    const { messages } = store.getSnapshot()
    // 第一问 / 第一轮助手 / 第二问
    expect(messages.map(m => m.role)).toEqual(['user', 'assistant', 'user'])
    expect((messages[1]!.parts[0] as TextPart).text).toBe('')
    // 旧轮次的收尾也不该把新一轮的 submitted 打回 idle
    expect(store.getSnapshot().status).toBe('submitted')
  })

  it('submit 清掉上一轮的 error', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })

    store.submit('你好')
    chan.latest().push({ kind: 'error', errorText: '炸了', receivedTime: T })
    await tick()
    frames.run()
    expect(store.getSnapshot().error).toBe('炸了')

    store.submit('再来')
    expect(store.getSnapshot().error).toBeUndefined()
    expect(store.getSnapshot().status).toBe('submitted')
  })

  it('宿主 onData 回调抛出时落进 error 而不是变成无人处理的 rejection', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({
      transport: chan.transport,
      frame: frames.options,
      onData: () => {
        throw new Error('宿主炸了')
      },
    })

    store.submit('你好')
    chan.latest().push({ kind: 'data', name: 'x', data: 1, transient: true, receivedTime: T })
    await tick()

    expect(store.getSnapshot().status).toBe('error')
    expect(store.getSnapshot().error).toContain('宿主炸了')
  })

  it('clear 清空消息与错误并回到 idle', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })

    store.submit('你好')
    chan.latest().push({ kind: 'error', errorText: '炸了', receivedTime: T })
    await tick()
    frames.run()

    store.clear()
    expect(store.getSnapshot()).toEqual({ messages: [], status: 'idle', error: undefined })
  })
})

describe('createThreadStore 订阅', () => {
  it('订阅拿到快照，退订后不再收到', () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    const listener = vi.fn()
    const off = store.subscribe(listener)

    store.submit('一')
    expect(listener).toHaveBeenCalledOnce()

    off()
    store.submit('二')
    expect(listener).toHaveBeenCalledOnce()
  })

  it('多个订阅者都会收到同一个快照对象', () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    const a = vi.fn()
    const b = vi.fn()
    store.subscribe(a)
    store.subscribe(b)

    store.submit('你好')

    expect(a.mock.calls[0]![0]).toBe(b.mock.calls[0]![0])
    expect(a.mock.calls[0]![0]).toBe(store.getSnapshot())
  })

  it('快照对象在两次发布之间保持同一引用', () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })

  it('回调里退订不影响本次广播的其余订阅者', () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    const second = vi.fn()
    const off = store.subscribe(() => off())
    store.subscribe(second)

    expect(() => store.submit('你好')).not.toThrow()
    expect(second).toHaveBeenCalledOnce()
  })

  it('dispose 之后既不发布也不接受新提交', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    const listener = vi.fn()
    store.subscribe(listener)

    store.submit('你好')
    const before = listener.mock.calls.length
    store.dispose()

    store.submit('还来')
    chan.latest().push(textStart('b1'))
    await tick()

    expect(listener.mock.calls.length).toBe(before)
  })
})

describe('createThreadStore 帧批处理', () => {
  it('一帧内的多次增量只发布一次', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })
    const listener = vi.fn()
    store.subscribe(listener)

    store.submit('你好')
    const afterSubmit = listener.mock.calls.length

    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '一'))
    chan.latest().push(textDelta('b1', '二'))
    chan.latest().push(textDelta('b1', '三'))
    await tick()

    // 事件都消费完了，但帧还没跑：一次都不该发布
    expect(listener.mock.calls.length).toBe(afterSubmit)
    expect(frames.pending()).toBe(1)

    frames.run()
    expect(listener.mock.calls.length).toBe(afterSubmit + 1)

    const snapshot = listener.mock.calls.at(-1)![0] as ThreadSnapshot
    expect((snapshot.messages[1]!.parts[0] as TextPart).text).toBe('一二三')
  })

  it('收尾时立即结算，不把最后一帧拖到下一帧', async () => {
    const chan = channelTransport()
    const frames = manualFrames()
    const store = createThreadStore({ transport: chan.transport, frame: frames.options })
    const listener = vi.fn()
    store.subscribe(listener)

    store.submit('你好')
    chan.latest().push(textStart('b1'))
    chan.latest().push(textDelta('b1', '完整内容'))
    chan.latest().push({ kind: 'finish', receivedTime: T })
    chan.latest().close()
    await tick()

    // 没跑任何帧，但流结束的结算是同步发布的
    expect(store.getSnapshot().status).toBe('idle')
    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).text).toBe('完整内容')
    // 结算已把待处理帧取消，跑帧不该再多发一次
    const settled = listener.mock.calls.length
    frames.run()
    expect(listener.mock.calls.length).toBe(settled)
  })
})
