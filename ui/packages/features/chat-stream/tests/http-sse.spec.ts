import type { ChatRequest } from '../src/model/message'
import type { NormalizedEvent } from '../src/reduce/events'
import { describe, expect, it, vi } from 'vitest'
import { createHttpSseTransport, DATA_STREAM_HEADER, DATA_STREAM_VERSION } from '../src/transport/http-sse'

const REQ: ChatRequest = {
  messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text: '你好' }] }],
  threadId: 'th-1',
}

function sseBody(payload: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(payload))
      controller.close()
    },
  })
}

function okResponse(payload: string): Response {
  return new Response(sseBody(payload), {
    status: 200,
    headers: { [DATA_STREAM_HEADER]: DATA_STREAM_VERSION },
  })
}

/** 构造假 Response，使 res.body 保持传入的流对象引用，便于装 spy。 */
function fakeResponse(init: {
  status: number
  headers: Record<string, string>
  body: ReadableStream<Uint8Array> | null
}): Response {
  return {
    ok: init.status >= 200 && init.status < 300,
    status: init.status,
    headers: { get: (name: string) => init.headers[name.toLowerCase()] ?? null },
    body: init.body,
  } as unknown as Response
}

/** 收全 stream() 产出的事件。 */
async function drain(
  transport: { stream: (req: ChatRequest, signal: AbortSignal) => AsyncIterable<NormalizedEvent> },
  signal: AbortSignal = new AbortController().signal,
): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = []
  for await (const ev of transport.stream(REQ, signal))
    events.push(ev)
  return events
}

describe('createHttpSseTransport 正常流', () => {
  it('把 SSE 帧解析并归一成事件序列', async () => {
    const fetchMock = vi.fn(async () => okResponse(
      'data: {"type":"start","messageId":"m1"}\n\n'
      + 'data: {"type":"text-start","id":"b1"}\n\n'
      + 'data: {"type":"text-delta","id":"b1","delta":"你"}\n\n'
      + 'data: {"type":"text-delta","id":"b1","delta":"好"}\n\n'
      + 'data: {"type":"text-end","id":"b1"}\n\n'
      + 'data: [DONE]\n\n',
    ))
    const transport = createHttpSseTransport({ url: '/api/ai/chat', fetch: fetchMock as unknown as typeof fetch })

    const events = await drain(transport)

    expect(events.map(e => e.kind)).toEqual(['message-start', 'text-start', 'text-delta', 'text-delta', 'text-end', 'finish'])
  })

  it('normalize 返回 null 的帧被跳过（finish-step 与未知类型）', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchMock = vi.fn(async () => okResponse(
      'data: {"type":"finish-step"}\n\n'
      + 'data: {"type":"brand-new-thing"}\n\n'
      + 'data: {"type":"finish"}\n\n',
    ))
    const transport = createHttpSseTransport({ url: '/x', fetch: fetchMock as unknown as typeof fetch })

    expect((await drain(transport)).map(e => e.kind)).toEqual(['finish'])
    spy.mockRestore()
  })

  it('请求带上 POST / JSON 头 / accept，并合入宿主 headers 与 body', async () => {
    const fetchMock = vi.fn(async () => okResponse('data: [DONE]\n\n'))
    const transport = createHttpSseTransport({
      url: '/api/ai/chat',
      headers: () => ({ 'authorization': 'Bearer t', 'X-Language': 'zh-CN' }),
      fetch: fetchMock as unknown as typeof fetch,
    })

    await drain(transport)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/ai/chat')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      'content-type': 'application/json',
      'accept': 'text/event-stream',
      'authorization': 'Bearer t',
      'X-Language': 'zh-CN',
    })
    expect(JSON.parse(init.body as string)).toEqual({ messages: REQ.messages, threadId: 'th-1' })
  })

  it('req.body 的宿主自定义字段并进 POST body', async () => {
    const fetchMock = vi.fn(async () => okResponse('data: [DONE]\n\n'))
    const transport = createHttpSseTransport({ url: '/x', fetch: fetchMock as unknown as typeof fetch })

    await drain({ stream: (_r, s) => transport.stream({ ...REQ, body: { model: 'x-1', temperature: 0.2 } }, s) })

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({ model: 'x-1', temperature: 0.2 })
  })

  it('receivedTime 取自注入时钟', async () => {
    let tick = 0
    const fetchMock = vi.fn(async () => okResponse('data: {"type":"finish"}\n\n'))
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: fetchMock as unknown as typeof fetch,
      now: () => ++tick * 10,
    })

    const events = await drain(transport)
    expect(events[0]!.receivedTime).toBe(10)
  })
})

describe('createHttpSseTransport 失败路径', () => {
  it('res.ok 为假 → error 事件；5xx 与 429 标可重试', async () => {
    const make = (status: number): ReturnType<typeof createHttpSseTransport> => createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => new Response(null, { status })) as unknown as typeof fetch,
    })

    const rateLimited = await drain(make(429))
    expect(rateLimited).toHaveLength(1)
    expect(rateLimited[0]).toMatchObject({ kind: 'error', retryable: true })
    expect((rateLimited[0] as { errorText: string }).errorText).toContain('429')

    expect(await drain(make(503))).toMatchObject([{ kind: 'error', retryable: true }])
    // 4xx（429 除外）不可重试
    expect(await drain(make(400))).toMatchObject([{ kind: 'error', retryable: false }])
    expect(await drain(make(401))).toMatchObject([{ kind: 'error', retryable: false }])
  })

  it('缺协议版本响应头 → error 且一个字节都不读 body', async () => {
    // 用假 Response 让 res.body 就是这个流本身，并以 getReader 是否被调用作为判据
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"finish"}\n\n'))
        controller.close()
      },
    })
    const getReader = vi.spyOn(body, 'getReader')
    const cancel = vi.spyOn(body, 'cancel')
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => fakeResponse({ status: 200, headers: {}, body })) as unknown as typeof fetch,
    })

    const events = await drain(transport)

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ kind: 'error', retryable: false })
    expect((events[0] as { errorText: string }).errorText).toContain(DATA_STREAM_HEADER)
    expect(getReader).not.toHaveBeenCalled()
    // 不读 body 也要关掉连接
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('协议版本对不上号（v2）同样拒绝', async () => {
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => new Response(sseBody('data: [DONE]\n\n'), {
        status: 200,
        headers: { [DATA_STREAM_HEADER]: 'v2' },
      })) as unknown as typeof fetch,
    })
    expect(await drain(transport)).toMatchObject([{ kind: 'error', retryable: false }])
  })

  it('响应没有正文 → error', async () => {
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => new Response(null, {
        status: 200,
        headers: { [DATA_STREAM_HEADER]: DATA_STREAM_VERSION },
      })) as unknown as typeof fetch,
    })
    const events = await drain(transport)
    expect(events).toMatchObject([{ kind: 'error', retryable: false }])
    expect((events[0] as { errorText: string }).errorText).toContain('正文')
  })

  it('fetch 抛非取消异常 → 可重试的 error，且 stream() 不 throw', async () => {
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }) as unknown as typeof fetch,
    })

    const events = await drain(transport)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ kind: 'error', retryable: true })
    expect((events[0] as { errorText: string }).errorText).toContain('Failed to fetch')
  })

  it('取消 → abort 事件而不是 error', async () => {
    const ac = new AbortController()
    ac.abort('用户取消')
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => {
        const err = new Error('aborted')
        err.name = 'AbortError'
        throw err
      }) as unknown as typeof fetch,
    })

    const events = await drain(transport, ac.signal)
    expect(events).toEqual([expect.objectContaining({ kind: 'abort', reason: '用户取消' })])
  })

  it('signal 未标记但异常名是 AbortError 时也认成取消', async () => {
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => {
        const err = new Error('aborted')
        err.name = 'AbortError'
        throw err
      }) as unknown as typeof fetch,
    })
    const events = await drain(transport)
    expect(events).toMatchObject([{ kind: 'abort' }])
    // 非字符串 reason 不带出
    expect((events[0] as { reason?: string }).reason).toBeUndefined()
  })

  it('读流途中炸掉 → 前面已产出的事件保留，末尾补一条 error', async () => {
    const encoder = new TextEncoder()
    // 分两次 pull，先投递数据再报错，避免 controller.error() 清空队列
    let pulled = 0
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1
        if (pulled === 1) {
          controller.enqueue(encoder.encode('data: {"type":"text-start","id":"b1"}\n\n'))
          return
        }
        controller.error(new Error('连接中断'))
      },
    })
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => new Response(body, {
        status: 200,
        headers: { [DATA_STREAM_HEADER]: DATA_STREAM_VERSION },
      })) as unknown as typeof fetch,
    })

    const events = await drain(transport)
    expect(events.map(e => e.kind)).toEqual(['text-start', 'error'])
    expect(events[1]).toMatchObject({ retryable: true })
  })

  it('坏 JSON 帧不打断流：产一条 error 后继续消费', async () => {
    const transport = createHttpSseTransport({
      url: '/x',
      fetch: vi.fn(async () => okResponse(
        'data: {"type":"text-start","id":"b1"}\n\n'
        + 'data: {"type":\n\n'
        + 'data: {"type":"finish"}\n\n',
      )) as unknown as typeof fetch,
    })

    const events = await drain(transport)
    expect(events.map(e => e.kind)).toEqual(['text-start', 'error', 'finish'])
    expect(events[1]).toMatchObject({ retryable: false })
  })
})
