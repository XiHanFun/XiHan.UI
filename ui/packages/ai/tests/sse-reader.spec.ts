import type { RawFrame, SseReaderOptions } from '../src/transport/sse-reader'
import { describe, expect, it } from 'vitest'
import { createSseReader } from '../src/transport/sse-reader'

/** 把若干字符串块拼成一条可读流，块边界即网络分包边界。 */
function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks)
        controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

async function collect(chunks: string[], options?: SseReaderOptions): Promise<RawFrame[]> {
  const frames: RawFrame[] = []
  for await (const frame of createSseReader(streamOf(...chunks), options))
    frames.push(frame)
  return frames
}

describe('createSseReader 行协议', () => {
  it('空行分帧，逐帧产出 data', async () => {
    const frames = await collect(['data: hello\n\ndata: world\n\n'])
    expect(frames.map(f => f.data)).toEqual(['hello', 'world'])
  })

  it('同一事件的多行 data 以 \\n 拼接（CRLF 与 LF 混用照切）', async () => {
    const frames = await collect(['data: a\r\ndata: b\ndata: c\r\n\r\n'])
    expect(frames).toHaveLength(1)
    expect(frames[0]!.data).toBe('a\nb\nc')
  })

  it('行尾 CRLF 被切在两个分包之间时不会误判成两个行尾', async () => {
    // 第一块以孤立 \r 结束，它是歧义的：必须等下一块到了才知道是 \r\n 还是单独的 \r
    const frames = await collect(['data: a\r', '\n\r\n'])
    expect(frames).toHaveLength(1)
    expect(frames[0]!.data).toBe('a')
  })

  it('单独的 \\r 也算行尾', async () => {
    const frames = await collect(['data: a\rdata: b\r\r'])
    expect(frames).toHaveLength(1)
    expect(frames[0]!.data).toBe('a\nb')
  })

  it('以 : 开头的注释行整行丢弃，且不单独成帧', async () => {
    const frames = await collect([': ping\n\n: keep-alive\n\ndata: real\n\n'])
    expect(frames.map(f => f.data)).toEqual(['real'])
  })

  it('event / id 被带出，retry 与未知字段一律忽略', async () => {
    const frames = await collect(['event: chunk\nid: 42\nretry: 3000\nfoo: bar\ndata: hi\n\n'])
    expect(frames).toHaveLength(1)
    expect(frames[0]).toMatchObject({ event: 'chunk', id: '42', data: 'hi' })
  })

  it('event / id 在帧之间会被重置，不粘到下一帧', async () => {
    const frames = await collect(['event: first\nid: 1\ndata: a\n\ndata: b\n\n'])
    expect(frames[0]).toMatchObject({ event: 'first', id: '1' })
    expect(frames[1]!.event).toBeUndefined()
    expect(frames[1]!.id).toBeUndefined()
  })

  it('只有 event 没有 data 的帧不产出', async () => {
    const frames = await collect(['event: lonely\n\ndata: x\n\n'])
    expect(frames.map(f => f.data)).toEqual(['x'])
  })

  it('冒号后至多吃掉一个空格，多出来的空格属于载荷', async () => {
    const frames = await collect(['data:no-space\n\n', 'data:  two-spaces\n\n'])
    expect(frames.map(f => f.data)).toEqual(['no-space', ' two-spaces'])
  })

  it('无冒号的行按空值字段处理', async () => {
    const frames = await collect(['data\n\n'])
    expect(frames).toHaveLength(1)
    expect(frames[0]!.data).toBe('')
  })

  it('末尾没被空行收尾的残帧直接丢弃', async () => {
    expect(await collect(['data: complete\n\ndata: dangling\n'])).toHaveLength(1)
    expect(await collect(['data: never-terminated'])).toHaveLength(0)
  })

  it('receivedTime 取自注入时钟', async () => {
    let tick = 0
    const frames = await collect(['data: a\n\ndata: b\n\n'], { now: () => ++tick * 100 })
    expect(frames.map(f => f.receivedTime)).toEqual([100, 200])
  })

  it('载荷可以跨任意分包边界重组', async () => {
    const frames = await collect(['da', 'ta: he', 'llo wor', 'ld\n', '\n'])
    expect(frames.map(f => f.data)).toEqual(['hello world'])
  })

  it('消费方提前 break 时把上游读取器关掉', async () => {
    let cancelled = false
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: a\n\ndata: b\n\n'))
      },
      cancel() {
        cancelled = true
      },
    })
    // 直接走迭代器协议：return() 就是 for-await 里 break 编译出来的东西，
    // 但不会写成一个"永远只跑一轮"的循环让 no-unreachable-loop 判死。
    const frames = createSseReader(stream)
    const first = await frames.next()
    expect(first.value?.data).toBe('a')

    await frames.return(undefined)

    expect(cancelled).toBe(true)
  })
})
