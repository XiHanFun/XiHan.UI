// HTTP + SSE 传输实现：stream() 不抛异常，错误路径一律先产一条事件再结束。
import type { ChatRequest } from '../model/message'
import type { NormalizedEvent } from '../reduce/events'
import type { Transport } from './transport'
import { normalizeDataStreamV1 } from '../normalize/datastream-v1'
import { createSseReader } from './sse-reader'

export const DATA_STREAM_HEADER = 'x-vercel-ai-ui-message-stream'
export const DATA_STREAM_VERSION = 'v1'

export interface HttpSseTransportOptions {
  url: string
  /** 每次请求时取一次的附加请求头。 */
  headers?: () => Record<string, string>
  /** 自定义 fetch，默认 globalThis.fetch。 */
  fetch?: typeof globalThis.fetch
  now?: () => number
}

/** 把异常映射成事件：取消产 abort，其余产 retryable 的 error。 */
function toFailureEvent(err: unknown, signal: AbortSignal, receivedTime: number): NormalizedEvent {
  const aborted = signal.aborted || (typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError')
  if (aborted) {
    const reason: unknown = signal.reason
    return { kind: 'abort', reason: typeof reason === 'string' ? reason : undefined, receivedTime }
  }
  return { kind: 'error', errorText: String(err), retryable: true, receivedTime }
}

/** 关闭响应体，已关闭或已被读取器锁定时忽略异常。 */
async function safeCancel(body: ReadableStream<Uint8Array> | null): Promise<void> {
  if (body === null)
    return
  try {
    await body.cancel()
  }
  catch {
    // 已关闭或仍被锁定，无需处理
  }
}

export function createHttpSseTransport(options: HttpSseTransportOptions): Transport {
  // 包一层调用而非直接取引用，保留 fetch 的 this 绑定
  const doFetch: typeof globalThis.fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init))
  const now = options.now ?? Date.now

  async function* stream(req: ChatRequest, signal: AbortSignal): AsyncGenerator<NormalizedEvent> {
    let res: Response
    try {
      res = await doFetch(options.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'text/event-stream',
          ...options.headers?.(),
        },
        body: JSON.stringify({ messages: req.messages, threadId: req.threadId, ...req.body }),
        signal,
      })
    }
    catch (err) {
      yield toFailureEvent(err, signal, now())
      return
    }

    if (!res.ok) {
      await safeCancel(res.body)
      yield {
        kind: 'error',
        errorText: `AI 流请求失败：HTTP ${res.status}`,
        retryable: res.status === 429 || res.status >= 500,
        receivedTime: now(),
      }
      return
    }

    // 协议版本不符则不读 body 直接报错
    if (res.headers.get(DATA_STREAM_HEADER) !== DATA_STREAM_VERSION) {
      await safeCancel(res.body)
      yield {
        kind: 'error',
        errorText: `AI 流协议版本不符：需要响应头 ${DATA_STREAM_HEADER}: ${DATA_STREAM_VERSION}`,
        retryable: false,
        receivedTime: now(),
      }
      return
    }

    const body = res.body
    if (body === null) {
      yield { kind: 'error', errorText: 'AI 流响应没有可读取的正文', retryable: false, receivedTime: now() }
      return
    }

    try {
      for await (const frame of createSseReader(body, { now })) {
        const ev = normalizeDataStreamV1(frame)
        if (ev !== null)
          yield ev
      }
    }
    catch (err) {
      yield toFailureEvent(err, signal, now())
    }
    finally {
      await safeCancel(body)
    }
  }

  return { stream }
}
