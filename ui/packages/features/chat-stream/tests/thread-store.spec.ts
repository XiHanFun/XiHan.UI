import type { ChatRequest } from '../src/model/message'
import type { TextPart } from '../src/model/part-kinds'
import type { NormalizedEvent } from '../src/reduce/events'
import type { ThreadSnapshot } from '../src/store/thread-store'
import type { Transport } from '../src/transport/transport'
import { describe, expect, it, vi } from 'vitest'
import { asBlockKey } from '../src/reduce/events'
import { createThreadStore } from '../src/store/thread-store'

const T = 1000

/** 让出事件循环，等 store 内部的 for await 推进一轮。 */
function tick(): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

/** 手动驱动的帧调度，只有调用 run() 才会执行排队的帧。 */
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
  readonly req: ChatRequest
  push: (ev: NormalizedEvent) => void
  close: () => void
  readonly signal: AbortSignal
}

/** 由测试逐个投喂事件的传输，每次 stream() 开一条独立通道。 */
function channelTransport(): { transport: Transport, runs: Run[], latest: () => Run } {
  const runs: Run[] = []

  const transport: Transport = {
    stream: (req, signal) => {
      const buffer: NormalizedEvent[] = []
      let wake: (() => void) | null = null
      let closed = false
      const bump = (): void => {
        wake?.()
        wake = null
      }
      runs.push({
        req,
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
      { id: 'xh-msg-1', role: 'user', parts: [{ type: 'text', text: '你好' }], parentId: null },
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

    // 全程只有瞬态帧，不创建助手消息
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

    // 停止当场收尾：b1 不再生长，消息记为 aborted；此后传输吐出的事件不再写入
    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).streaming).toBe(false)
    expect(store.getSnapshot().messages[1]!.status).toBe('aborted')
    chan.latest().push(textDelta('b1', '不该出现'))
    chan.latest().push({ kind: 'finish', receivedTime: T })
    chan.latest().close()
    await tick()
    frames.run()

    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).text).toBe('')
    // 旧轮次结束时再发布一次，内容不变
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

    // 旧轮次后续吐出的事件不再写入
    firstRun.push(textDelta('b1', '旧的'))
    firstRun.push({ kind: 'finish', receivedTime: T })
    firstRun.close()
    await tick()
    frames.run()

    const { messages } = store.getSnapshot()
    // 第一问、第一轮助手、第二问
    expect(messages.map(m => m.role)).toEqual(['user', 'assistant', 'user'])
    expect((messages[1]!.parts[0] as TextPart).text).toBe('')
    // 旧轮次收尾不改动新一轮的状态
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
    expect(store.getSnapshot()).toEqual({ messages: [], status: 'idle', error: undefined, branches: {} })
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

    // 事件已消费但帧未执行，尚未发布
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

    // 未执行任何帧，流结束的结算已同步发布
    expect(store.getSnapshot().status).toBe('idle')
    expect((store.getSnapshot().messages[1]!.parts[0] as TextPart).text).toBe('完整内容')
    // 结算已取消待处理帧，再执行帧不会重复发布
    const settled = listener.mock.calls.length
    frames.run()
    expect(listener.mock.calls.length).toBe(settled)
  })
})

/** 跑完一轮：开一块正文、写入 text、收尾并关流。 */
async function answer(chan: ReturnType<typeof channelTransport>, text: string, finish = true): Promise<void> {
  const run = chan.latest()
  run.push(textStart(`b-${chan.runs.length}`))
  run.push(textDelta(`b-${chan.runs.length}`, text))
  if (finish)
    run.push({ kind: 'finish', receivedTime: T })
  run.close()
  await tick()
}

function textOf(message: { parts: readonly { type: string }[] }): string {
  return message.parts.filter((part): part is TextPart => part.type === 'text').map(part => part.text).join('')
}

describe('createThreadStore 附件', () => {
  it('submit 接受 parts：正文与附件原样进 user 消息', () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit([
      { type: 'text', text: '看看这张图' },
      { type: 'file', url: 'blob:a', mediaType: 'image/png', filename: 'a.png' },
    ])
    const [user] = store.getSnapshot().messages
    expect(user!.parts.map(part => part.type)).toEqual(['text', 'file'])
    expect(chan.latest().req.messages[0]!.parts[1]).toMatchObject({ type: 'file', filename: 'a.png' })
  })

  it('用户消息里出现 text / file / data 以外的块立即报错', () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    expect(() => store.submit([{ type: 'step-start' }])).toThrow(/text \/ file \/ data/)
    expect(chan.runs).toHaveLength(0)
  })
})

describe('createThreadStore 重新生成与分支', () => {
  it('regenerate 在同一提问下新建一条候选并选中，原回复留作分支', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('写首诗')
    await answer(chan, '第一版')
    const first = store.getSnapshot().messages[1]!

    store.regenerate()
    expect(chan.latest().req).toMatchObject({ trigger: 'regenerate', messageId: first.id })
    expect(chan.latest().req.messages.map(m => m.role)).toEqual(['user'])
    await answer(chan, '第二版')

    const snapshot = store.getSnapshot()
    expect(snapshot.messages).toHaveLength(2)
    expect(textOf(snapshot.messages[1]!)).toBe('第二版')
    expect(snapshot.messages[1]!.parentId).toBe(snapshot.messages[0]!.id)
    expect(snapshot.branches[snapshot.messages[1]!.id]).toEqual({ index: 1, count: 2 })
    expect(snapshot.branches[snapshot.messages[0]!.id]).toEqual({ index: 0, count: 1 })
  })

  it('selectBranch 切回旧回复，其下沿用那一支的路径', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    await answer(chan, '甲')
    store.submit('追问')
    await answer(chan, '甲的追答')
    const firstReply = store.getSnapshot().messages[1]!

    store.regenerate(firstReply.id)
    await answer(chan, '乙')
    expect(store.getSnapshot().messages.map(textOf)).toEqual(['问', '乙'])

    store.selectBranch(firstReply.id, 0)
    expect(store.getSnapshot().messages.map(textOf)).toEqual(['问', '甲', '追问', '甲的追答'])
    store.selectBranch(firstReply.id, 1)
    expect(store.getSnapshot().messages.map(textOf)).toEqual(['问', '乙'])
  })

  it('selectBranch 下标越界、regenerate 指向用户消息都立即报错', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    await answer(chan, '答')
    const [user, reply] = store.getSnapshot().messages
    expect(() => store.selectBranch(reply!.id, 3)).toThrow(/越界/)
    expect(() => store.regenerate(user!.id)).toThrow(/只针对助手消息/)
  })

  it('服务端改了回复的 id，分支关系跟着改名', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    chan.latest().push({ kind: 'message-start', messageId: 'srv-1', role: 'assistant', receivedTime: T })
    await answer(chan, '答')
    store.submit('追问')
    const snapshot = store.getSnapshot()
    expect(snapshot.messages.map(m => m.id)).toContain('srv-1')
    expect(snapshot.messages[2]!.parentId).toBe('srv-1')
  })
})

describe('createThreadStore 编辑重发', () => {
  it('edit 在原提问的位置插入新提问并重发，原提问连同回复留作分支', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('原问题')
    await answer(chan, '原回答')
    const original = store.getSnapshot().messages[0]!

    store.edit(original.id, '改过的问题')
    expect(chan.latest().req).toMatchObject({ trigger: 'edit', messageId: original.id })
    expect(chan.latest().req.messages.map(textOf)).toEqual(['改过的问题'])
    await answer(chan, '新回答')

    const snapshot = store.getSnapshot()
    expect(snapshot.messages.map(textOf)).toEqual(['改过的问题', '新回答'])
    expect(snapshot.branches[snapshot.messages[0]!.id]).toEqual({ index: 1, count: 2 })

    store.selectBranch(snapshot.messages[0]!.id, 0)
    expect(store.getSnapshot().messages.map(textOf)).toEqual(['原问题', '原回答'])
  })

  it('edit 只接受用户消息', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    await answer(chan, '答')
    expect(() => store.edit(store.getSnapshot().messages[1]!.id, 'x')).toThrow(/只针对用户消息/)
  })
})

describe('createThreadStore 重试', () => {
  it('失败的回复被撤掉，从同一提问重新发起，不留分支', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    chan.latest().push({ kind: 'error', errorText: '过载', retryable: true, receivedTime: T })
    chan.latest().close()
    await tick()
    const failed = store.getSnapshot().messages[1]!
    expect(failed.status).toBe('error')

    store.retry()
    expect(chan.latest().req).toMatchObject({ trigger: 'retry', messageId: failed.id })
    expect(store.getSnapshot().messages).toHaveLength(1)
    await answer(chan, '好了')
    const snapshot = store.getSnapshot()
    expect(snapshot.messages.map(textOf)).toEqual(['问', '好了'])
    expect(snapshot.branches[snapshot.messages[1]!.id]).toEqual({ index: 0, count: 1 })
  })

  it('第一帧之前就失败时从最后一条提问重新发起', async () => {
    const chan = channelTransport()
    const store = createThreadStore({
      transport: chan.transport,
      frame: manualFrames().options,
      onData: () => {
        throw new Error('宿主炸了')
      },
    })
    store.submit('问')
    chan.latest().push({ kind: 'data', name: 'x', data: 1, transient: true, receivedTime: T })
    await tick()
    expect(store.getSnapshot().status).toBe('error')

    store.retry()
    expect(chan.runs).toHaveLength(2)
    expect(chan.latest().req.messages.map(textOf)).toEqual(['问'])
  })

  it('没有失败的运行时 retry 报错', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    await answer(chan, '答')
    expect(() => store.retry()).toThrow(/没有可以重试/)
  })
})

describe('createThreadStore 续写', () => {
  it('stop 截断的回复记为 aborted，continue 在同一条上接着写', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('写长文')
    chan.latest().push(textStart('a'))
    chan.latest().push(textDelta('a', '写到一半'))
    await tick()
    store.stop()
    await tick()
    const cut = store.getSnapshot().messages[1]!
    expect(cut.status).toBe('aborted')

    store.continue()
    expect(chan.latest().req).toMatchObject({ trigger: 'continue', messageId: cut.id })
    expect(chan.latest().req.messages.at(-1)!.id).toBe(cut.id)
    // 续写这一轮的起始帧不改 id
    chan.latest().push({ kind: 'message-start', messageId: 'srv-9', role: 'assistant', receivedTime: T })
    await answer(chan, '，接着写完')

    const snapshot = store.getSnapshot()
    expect(snapshot.messages).toHaveLength(2)
    expect(snapshot.messages[1]!.id).toBe(cut.id)
    expect(textOf(snapshot.messages[1]!)).toBe('写到一半，接着写完')
    expect(snapshot.messages[1]!.status).toBe('complete')
  })

  it('没被截断的回复不能续写', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    await answer(chan, '答')
    expect(() => store.continue()).toThrow(/没有被截断/)
  })

  it('因长度上限收尾的回复可以续写', async () => {
    const chan = channelTransport()
    const store = createThreadStore({ transport: chan.transport, frame: manualFrames().options })
    store.submit('问')
    chan.latest().push({ kind: 'message-metadata', metadata: { finishReason: 'length' }, receivedTime: T })
    await answer(chan, '答到上限')
    expect(() => store.continue()).not.toThrow()
    expect(chan.latest().req.trigger).toBe('continue')
  })
})

describe('createThreadStore 恢复会话', () => {
  it('线性历史按数组顺序相连；getTree 导出的整棵树可以原样恢复', async () => {
    const chan = channelTransport()
    const store = createThreadStore({
      transport: chan.transport,
      frame: manualFrames().options,
      messages: [
        { id: 'u1', role: 'user', parts: [{ type: 'text', text: '问' }] },
        { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: '答' }] },
      ],
    })
    expect(store.getSnapshot().messages.map(m => m.parentId)).toEqual([null, 'u1'])
    store.regenerate('a1')
    await answer(chan, '另一个答')

    const restored = createThreadStore({ transport: chan.transport, frame: manualFrames().options, messages: store.getTree() })
    expect(restored.getSnapshot().messages.map(textOf)).toEqual(['问', '另一个答'])
    expect(restored.getSnapshot().branches[restored.getSnapshot().messages[1]!.id]).toEqual({ index: 1, count: 2 })
  })

  it('parentId 指向不存在的消息时立即报错', () => {
    const chan = channelTransport()
    expect(() => createThreadStore({
      transport: chan.transport,
      messages: [{ id: 'a1', role: 'assistant', parts: [], parentId: 'missing' }],
    })).toThrow(/parentId/)
  })
})
