import type { RawFrame } from '../src/transport/sse-reader'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DATA_STREAM_DONE, normalizeDataStreamV1 } from '../src/normalize/datastream-v1'

const TIME = 1_700_000_000_000

function raw(data: string, receivedTime = TIME): RawFrame {
  return { data, receivedTime }
}

function frame(payload: Record<string, unknown>, receivedTime = TIME): RawFrame {
  return raw(JSON.stringify(payload), receivedTime)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('normalizeDataStreamV1 映射表', () => {
  it('start → message-start', () => {
    expect(normalizeDataStreamV1(frame({ type: 'start', messageId: 'm1' }))).toEqual({
      kind: 'message-start',
      messageId: 'm1',
      role: 'assistant',
      receivedTime: TIME,
    })
  })

  it('缺 messageId 时退化成空串而不是丢帧', () => {
    expect(normalizeDataStreamV1(frame({ type: 'start' }))).toMatchObject({ kind: 'message-start', messageId: '' })
  })

  it('文本三件套', () => {
    expect(normalizeDataStreamV1(frame({ type: 'text-start', id: 'b1' }))).toEqual({
      kind: 'text-start',
      block: 'b1',
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'text-delta', id: 'b1', delta: '你好' }))).toEqual({
      kind: 'text-delta',
      block: 'b1',
      delta: '你好',
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'text-end', id: 'b1' }))).toEqual({
      kind: 'text-end',
      block: 'b1',
      receivedTime: TIME,
    })
  })

  it('推理三件套', () => {
    expect(normalizeDataStreamV1(frame({ type: 'reasoning-start', id: 'r1' }))).toMatchObject({
      kind: 'reasoning-start',
      block: 'r1',
    })
    expect(normalizeDataStreamV1(frame({ type: 'reasoning-delta', id: 'r1', delta: '想' }))).toMatchObject({
      kind: 'reasoning-delta',
      block: 'r1',
      delta: '想',
    })
    expect(normalizeDataStreamV1(frame({ type: 'reasoning-end', id: 'r1' }))).toMatchObject({
      kind: 'reasoning-end',
      block: 'r1',
    })
  })

  it('工具调用全家桶', () => {
    expect(normalizeDataStreamV1(frame({ type: 'tool-input-start', toolCallId: 't1', toolName: 'search' }))).toEqual({
      kind: 'tool-input-start',
      toolCallId: 't1',
      toolName: 'search',
      receivedTime: TIME,
    })
    // 线格式字段 inputTextDelta 归一为 delta
    expect(normalizeDataStreamV1(frame({ type: 'tool-input-delta', toolCallId: 't1', inputTextDelta: '{"q' }))).toEqual({
      kind: 'tool-input-delta',
      toolCallId: 't1',
      delta: '{"q',
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'tool-input-available', toolCallId: 't1', input: { q: 'x' } }))).toEqual({
      kind: 'tool-input-available',
      toolCallId: 't1',
      input: { q: 'x' },
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'tool-output-available', toolCallId: 't1', output: [1, 2] }))).toEqual({
      kind: 'tool-output',
      toolCallId: 't1',
      output: [1, 2],
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'tool-output-error', toolCallId: 't1', errorText: '超时' }))).toEqual({
      kind: 'tool-error',
      toolCallId: 't1',
      errorText: '超时',
      receivedTime: TIME,
    })
  })

  it('审批请求的 isAutomatic 只认真正的 true', () => {
    expect(normalizeDataStreamV1(frame({
      type: 'tool-approval-request',
      toolCallId: 't1',
      approvalId: 'a1',
      isAutomatic: true,
    }))).toMatchObject({ kind: 'tool-approval-request', approvalId: 'a1', isAutomatic: true })

    expect(normalizeDataStreamV1(frame({
      type: 'tool-approval-request',
      toolCallId: 't1',
      approvalId: 'a1',
      isAutomatic: 'yes',
    }))).toMatchObject({ isAutomatic: false })
  })

  it('来源与文件', () => {
    expect(normalizeDataStreamV1(frame({ type: 'source-url', sourceId: 's1', url: 'https://e.x', title: 'T' }))).toEqual({
      kind: 'source',
      part: { type: 'source-url', sourceId: 's1', url: 'https://e.x', title: 'T' },
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'source-document', sourceId: 's2', title: 'D', mediaType: 'application/pdf' }))).toEqual({
      kind: 'source',
      part: { type: 'source-document', sourceId: 's2', title: 'D', mediaType: 'application/pdf' },
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'file', url: 'https://f.x/a.png', mediaType: 'image/png', filename: 'a.png' }))).toEqual({
      kind: 'file',
      part: { type: 'file', url: 'https://f.x/a.png', mediaType: 'image/png', filename: 'a.png' },
      receivedTime: TIME,
    })
  })

  it('start-step → step-start；finish → finish；abort 带 reason', () => {
    expect(normalizeDataStreamV1(frame({ type: 'start-step' }))).toEqual({ kind: 'step-start', receivedTime: TIME })
    expect(normalizeDataStreamV1(frame({ type: 'finish' }))).toEqual({ kind: 'finish', receivedTime: TIME })
    expect(normalizeDataStreamV1(frame({ type: 'abort', reason: '用户取消' }))).toEqual({
      kind: 'abort',
      reason: '用户取消',
      receivedTime: TIME,
    })
  })

  it('message-metadata 非对象时退化成空对象', () => {
    expect(normalizeDataStreamV1(frame({ type: 'message-metadata', messageMetadata: { totalTokens: 9 } }))).toEqual({
      kind: 'message-metadata',
      metadata: { totalTokens: 9 },
      receivedTime: TIME,
    })
    expect(normalizeDataStreamV1(frame({ type: 'message-metadata', messageMetadata: 'nope' }))).toMatchObject({
      kind: 'message-metadata',
      metadata: {},
    })
  })

  it('流内 error 不自行判定 retryable（留给 transport 按 HTTP 语义标）', () => {
    const ev = normalizeDataStreamV1(frame({ type: 'error', errorText: '模型过载' }))
    expect(ev).toMatchObject({ kind: 'error', errorText: '模型过载' })
    expect((ev as { retryable?: boolean }).retryable).toBeUndefined()
  })

  it('receivedTime 一律从帧上原样搬运，normalize 不读时钟', () => {
    expect(normalizeDataStreamV1(frame({ type: 'finish' }, 42))!.receivedTime).toBe(42)
    expect(normalizeDataStreamV1(raw(DATA_STREAM_DONE, 43))!.receivedTime).toBe(43)
  })
})

describe('normalizeDataStreamV1 哨兵与丢弃', () => {
  it('[DONE] 哨兵在 JSON 解析之前就被认掉', () => {
    expect(normalizeDataStreamV1(raw(DATA_STREAM_DONE))).toEqual({ kind: 'finish', receivedTime: TIME })
    // 两侧带空白也认
    expect(normalizeDataStreamV1(raw(`  ${DATA_STREAM_DONE}  `))).toMatchObject({ kind: 'finish' })
  })

  it('finish-step 认得但不映射', () => {
    expect(normalizeDataStreamV1(frame({ type: 'finish-step' }))).toBeNull()
  })

  it('不认识的 type 丢弃（协议向前扩展，不是错误）', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(normalizeDataStreamV1(frame({ type: 'quantum-entangle' }))).toBeNull()
    expect(spy).toHaveBeenCalledOnce()
  })
})

describe('normalizeDataStreamV1 损坏帧', () => {
  const broken: NormalizedErrorShape = { kind: 'error', errorText: 'AI 流数据帧无法解析', retryable: false, receivedTime: TIME }
  interface NormalizedErrorShape {
    kind: string
    errorText: string
    retryable: boolean
    receivedTime: number
  }

  it('坏 JSON → error 且不可重试', () => {
    expect(normalizeDataStreamV1(raw('{"type":'))).toEqual(broken)
  })

  it('合法 JSON 但不是对象 → error', () => {
    expect(normalizeDataStreamV1(raw('[1,2,3]'))).toEqual(broken)
    expect(normalizeDataStreamV1(raw('"just a string"'))).toEqual(broken)
    expect(normalizeDataStreamV1(raw('null'))).toEqual(broken)
  })

  it('缺 type 或 type 不是字符串 → error', () => {
    expect(normalizeDataStreamV1(frame({ messageId: 'm1' }))).toEqual(broken)
    expect(normalizeDataStreamV1(frame({ type: 7 }))).toEqual(broken)
  })
})

describe('normalizeDataStreamV1 data-<name>', () => {
  it('拆出 name 与 transient', () => {
    expect(normalizeDataStreamV1(frame({ type: 'data-weather', data: { c: 21 }, transient: true }))).toEqual({
      kind: 'data',
      name: 'weather',
      data: { c: 21 },
      transient: true,
      receivedTime: TIME,
    })
  })

  it('transient 缺省为 false，且只认真正的 true', () => {
    expect(normalizeDataStreamV1(frame({ type: 'data-chart', data: 1 }))).toMatchObject({ name: 'chart', transient: false })
    expect(normalizeDataStreamV1(frame({ type: 'data-chart', data: 1, transient: 'true' }))).toMatchObject({ transient: false })
  })

  it('name 可以带连字符，只剥掉第一段 data- 前缀', () => {
    expect(normalizeDataStreamV1(frame({ type: 'data-user-profile', data: null }))).toMatchObject({ name: 'user-profile' })
  })
})
