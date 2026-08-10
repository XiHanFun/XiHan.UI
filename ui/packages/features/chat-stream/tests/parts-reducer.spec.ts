import type { ReasoningPart, TextPart, ToolPart } from '../src/model/part-kinds'
import type { NormalizedEvent } from '../src/reduce/events'
import type { ReduceState } from '../src/reduce/parts-reducer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { asBlockKey } from '../src/reduce/events'
import { createReduceState, reduceEvent } from '../src/reduce/parts-reducer'

const T = 1000

function apply(state: ReduceState, ...events: readonly NormalizedEvent[]): ReduceState {
  let next = state
  for (const ev of events) next = reduceEvent(next, ev)
  return next
}

function textStart(id: string, receivedTime = T): NormalizedEvent {
  return { kind: 'text-start', block: asBlockKey(id), receivedTime }
}
function textDelta(id: string, delta: string, receivedTime = T): NormalizedEvent {
  return { kind: 'text-delta', block: asBlockKey(id), delta, receivedTime }
}
function textEnd(id: string, receivedTime = T): NormalizedEvent {
  return { kind: 'text-end', block: asBlockKey(id), receivedTime }
}

function silenceWarnings(): void {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('不变量 1：单调追加，已收尾的块永不被后续增量触及', () => {
  it('迟到的 delta 命中已删 key 时被丢弃，不抛且 parts 长度不变', () => {
    silenceWarnings()
    const closed = apply(createReduceState('m1'), textStart('b1'), textDelta('b1', '正文'), textEnd('b1'))
    expect(closed.message.parts).toHaveLength(1)

    const late = reduceEvent(closed, textDelta('b1', '迟到'))

    expect(late.message.parts).toHaveLength(1)
    expect((late.message.parts[0] as TextPart).text).toBe('正文')
    expect((late.message.parts[0] as TextPart).streaming).toBe(false)
  })

  it('从未开始的块上来 delta 同样只丢弃', () => {
    silenceWarnings()
    const state = createReduceState('m1')
    const next = reduceEvent(state, textDelta('ghost', 'x'))
    expect(next.message.parts).toEqual([])
  })

  it('重复的 end 帧静默忽略', () => {
    const twice = apply(createReduceState('m1'), textStart('b1'), textEnd('b1'), textEnd('b1'))
    expect(twice.message.parts).toHaveLength(1)
    expect((twice.message.parts[0] as TextPart).streaming).toBe(false)
  })

  it('并发两个 text 块交错 delta 后顺序按 start 到达序、内容各归各位', () => {
    const state = apply(
      createReduceState('m1'),
      textStart('a'),
      textStart('b'),
      textDelta('a', 'A1'),
      textDelta('b', 'B1'),
      textDelta('a', 'A2'),
      textDelta('b', 'B2'),
    )
    expect(state.message.parts.map(p => (p as TextPart).text)).toEqual(['A1A2', 'B1B2'])
  })

  it('一个块收尾不影响另一个仍在生长的块', () => {
    const state = apply(
      createReduceState('m1'),
      textStart('a'),
      textStart('b'),
      textEnd('a'),
      textDelta('b', '继续'),
    )
    expect((state.message.parts[0] as TextPart).streaming).toBe(false)
    expect(state.message.parts[1]).toMatchObject({ text: '继续', streaming: true })
  })
})

describe('不变量 2：工具入参守卫', () => {
  const start: NormalizedEvent = { kind: 'tool-input-start', toolCallId: 't1', toolName: 'search', receivedTime: T }

  it('tool-input-delta 只动 rawInput，input 仍为 undefined', () => {
    const state = apply(
      createReduceState('m1'),
      start,
      { kind: 'tool-input-delta', toolCallId: 't1', delta: '{"q":', receivedTime: T },
      { kind: 'tool-input-delta', toolCallId: 't1', delta: '"x"}', receivedTime: T },
    )
    const part = state.message.parts[0] as ToolPart
    expect(part.rawInput).toBe('{"q":"x"}')
    expect(part.input).toBeUndefined()
    expect(part.state).toBe('input-streaming')
  })

  it('只有 input-available 才写结构化 input', () => {
    const state = apply(
      createReduceState('m1'),
      start,
      { kind: 'tool-input-delta', toolCallId: 't1', delta: '{"q":"x"}', receivedTime: T },
      { kind: 'tool-input-available', toolCallId: 't1', input: { q: 'x' }, receivedTime: T },
    )
    const part = state.message.parts[0] as ToolPart
    expect(part.input).toEqual({ q: 'x' })
    expect(part.state).toBe('input-available')
    // 结构化入参写入后 rawInput 原文仍保留
    expect(part.rawInput).toBe('{"q":"x"}')
  })

  it('output 与 error 收口该次调用，之后的事件不再落到它身上', () => {
    silenceWarnings()
    const done = apply(
      createReduceState('m1'),
      start,
      { kind: 'tool-output', toolCallId: 't1', output: { hit: 3 }, receivedTime: T },
    )
    expect(done.message.parts[0]).toMatchObject({ state: 'output-available', output: { hit: 3 } })
    expect(done.openTools.size).toBe(0)

    const after = reduceEvent(done, { kind: 'tool-error', toolCallId: 't1', errorText: '迟到', receivedTime: T })
    expect(after.message.parts[0]).toMatchObject({ state: 'output-available' })
  })

  it('tool-output-error 写 errorText 并置 output-error', () => {
    const state = apply(
      createReduceState('m1'),
      start,
      { kind: 'tool-error', toolCallId: 't1', errorText: '超时', receivedTime: T },
    )
    expect(state.message.parts[0]).toMatchObject({ state: 'output-error', errorText: '超时' })
  })

  it('审批请求挂在 tool part 上，初始 pending', () => {
    const state = apply(
      createReduceState('m1'),
      start,
      { kind: 'tool-approval-request', toolCallId: 't1', approvalId: 'a1', isAutomatic: false, receivedTime: T },
    )
    expect((state.message.parts[0] as ToolPart).approval).toEqual({
      approvalId: 'a1',
      isAutomatic: false,
      status: 'pending',
    })
  })

  it('不在进行中的调用表里的工具事件被丢弃', () => {
    silenceWarnings()
    const state = reduceEvent(createReduceState('m1'), {
      kind: 'tool-output',
      toolCallId: 'nope',
      output: 1,
      receivedTime: T,
    })
    expect(state.message.parts).toEqual([])
  })
})

describe('非流式工具调用', () => {
  it('没有前导 tool-input-start 时按帧上的 toolName 现场补建', () => {
    // 服务端一次性给出入参时不发 tool-input-start
    const state = apply(
      createReduceState('m1'),
      { kind: 'tool-input-available', toolCallId: 't9', toolName: 'search', input: { q: 'x' }, receivedTime: T },
      { kind: 'tool-output', toolCallId: 't9', output: [1, 2], receivedTime: T },
    )
    expect(state.message.parts).toEqual([{
      type: 'tool',
      toolCallId: 't9',
      toolName: 'search',
      state: 'output-available',
      rawInput: '',
      input: { q: 'x' },
      output: [1, 2],
    }])
  })

  it('既不在调用表里、又没带 toolName 时仍旧丢弃', () => {
    silenceWarnings()
    const state = reduceEvent(createReduceState('m1'), {
      kind: 'tool-input-available',
      toolCallId: 't9',
      input: { q: 'x' },
      receivedTime: T,
    })
    expect(state.message.parts).toEqual([])
  })
})

describe('终止事件收尾', () => {
  it('finish 把开着的文本块与没走完的工具一起收干净', () => {
    const state = apply(
      createReduceState('m1'),
      textStart('b1'),
      textDelta('b1', '半句'),
      { kind: 'tool-input-start', toolCallId: 't1', toolName: 'search', receivedTime: T },
      { kind: 'tool-input-delta', toolCallId: 't1', delta: '{"q', receivedTime: T },
      { kind: 'finish', receivedTime: T },
    )
    expect((state.message.parts[0] as TextPart).streaming).toBe(false)
    // 入参未吐完的调用被置为 output-error
    expect(state.message.parts[1]).toMatchObject({ type: 'tool', state: 'output-error' })
    expect((state.message.parts[1] as ToolPart).errorText).toBeUndefined()
    expect(state.openBlocks.size).toBe(0)
    expect(state.openTools.size).toBe(0)
  })
})

describe('不变量 3：transient 隔离', () => {
  it('瞬态 data 不进 parts（store 已分流，这里只兜底）', () => {
    silenceWarnings()
    const state = reduceEvent(createReduceState('m1'), {
      kind: 'data',
      name: 'progress',
      data: { pct: 30 },
      transient: true,
      receivedTime: T,
    })
    expect(state.message.parts).toEqual([])
  })

  it('非瞬态 data 正常进 parts', () => {
    const state = reduceEvent(createReduceState('m1'), {
      kind: 'data',
      name: 'chart',
      data: { series: [1] },
      transient: false,
      receivedTime: T,
    })
    expect(state.message.parts).toEqual([{ type: 'data', name: 'chart', data: { series: [1] } }])
  })
})

describe('推理块时间戳', () => {
  it('reasoning-start / end 从事件的 receivedTime 写出 startTime / endTime', () => {
    const state = apply(
      createReduceState('m1'),
      { kind: 'reasoning-start', block: asBlockKey('r1'), receivedTime: 100 },
      { kind: 'reasoning-delta', block: asBlockKey('r1'), delta: '嗯', receivedTime: 200 },
      { kind: 'reasoning-end', block: asBlockKey('r1'), receivedTime: 500 },
    )
    const part = state.message.parts[0] as ReasoningPart
    expect(part).toMatchObject({ type: 'reasoning', text: '嗯', streaming: false, startTime: 100, endTime: 500 })
    expect(part.endTime! - part.startTime!).toBe(400)
  })

  it('文本块不记时间', () => {
    const state = apply(createReduceState('m1'), textStart('b1', 100), textEnd('b1', 500))
    expect(state.message.parts[0]).not.toHaveProperty('endTime')
    expect(state.message.parts[0]).not.toHaveProperty('startTime')
  })
})

describe('收尾', () => {
  it('finish 把所有未闭合块的 streaming 收干净', () => {
    const state = apply(
      createReduceState('m1'),
      textStart('a'),
      textDelta('a', 'A'),
      { kind: 'reasoning-start', block: asBlockKey('r'), receivedTime: T },
      { kind: 'finish', receivedTime: T },
    )
    expect(state.message.parts.every(p => (p as TextPart).streaming === false)).toBe(true)
    expect(state.openBlocks.size).toBe(0)
  })

  it('abort 与 finish 同路：只是别再长了，不追加 ErrorPart', () => {
    const state = apply(
      createReduceState('m1'),
      textStart('a'),
      textDelta('a', 'A'),
      { kind: 'abort', reason: '用户取消', receivedTime: T },
    )
    expect(state.message.parts).toHaveLength(1)
    expect(state.message.parts[0]).toMatchObject({ type: 'text', text: 'A', streaming: false })
  })

  it('收尾后迟到的 delta 依旧被丢弃', () => {
    silenceWarnings()
    const finished = apply(createReduceState('m1'), textStart('a'), { kind: 'finish', receivedTime: T })
    const late = reduceEvent(finished, textDelta('a', '迟到'))
    expect((late.message.parts[0] as TextPart).text).toBe('')
  })
})

describe('其余映射', () => {
  it('message-start 覆盖 id 与 role', () => {
    const state = reduceEvent(createReduceState('local-1'), {
      kind: 'message-start',
      messageId: 'server-9',
      role: 'assistant',
      receivedTime: T,
    })
    expect(state.message.id).toBe('server-9')
    expect(state.message.role).toBe('assistant')
  })

  it('error 追加 ErrorPart 并原样带上 retryable', () => {
    const state = reduceEvent(createReduceState('m1'), {
      kind: 'error',
      errorText: '模型过载',
      retryable: true,
      receivedTime: T,
    })
    expect(state.message.parts).toEqual([{ type: 'error', errorText: '模型过载', retryable: true }])
  })

  it('step-start / source / file 按到达序追加', () => {
    const state = apply(
      createReduceState('m1'),
      { kind: 'step-start', receivedTime: T },
      { kind: 'source', part: { type: 'source-url', sourceId: 's1', url: 'https://e.x' }, receivedTime: T },
      { kind: 'file', part: { type: 'file', url: 'https://f.x/a.png', mediaType: 'image/png' }, receivedTime: T },
    )
    expect(state.message.parts.map(p => p.type)).toEqual(['step-start', 'source-url', 'file'])
  })

  it('message-metadata 落在 message 上而不是 parts 里', () => {
    const state = reduceEvent(createReduceState('m1'), {
      kind: 'message-metadata',
      metadata: { totalTokens: 12 },
      receivedTime: T,
    })
    expect(state.message.metadata).toEqual({ totalTokens: 12 })
    expect(state.message.parts).toEqual([])
  })
})

describe('纯函数', () => {
  const seed = apply(createReduceState('m1'), textStart('a'), textDelta('a', 'A'))

  it('同一 (state, event) 重放得到同一结果', () => {
    const ev = textDelta('a', 'B')
    expect(reduceEvent(seed, ev)).toEqual(reduceEvent(seed, ev))
  })

  it('不原地改入参：入参 state 在归约后保持原样', () => {
    const before = structuredClone({
      parts: seed.message.parts,
      openBlocks: [...seed.openBlocks],
      openTools: [...seed.openTools],
    })
    reduceEvent(seed, textDelta('a', 'B'))
    reduceEvent(seed, textEnd('a'))
    expect({
      parts: seed.message.parts,
      openBlocks: [...seed.openBlocks],
      openTools: [...seed.openTools],
    }).toEqual(before)
  })

  it('归约结果与入参不共享 parts 数组引用', () => {
    const next = reduceEvent(seed, textDelta('a', 'B'))
    expect(next.message.parts).not.toBe(seed.message.parts)
  })
})
