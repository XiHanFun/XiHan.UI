// HTTP + SSE 传输实现。
//
// 这里不认识 XiHan.Framework，也不知道租户/配额是什么：429 只按 HTTP 语义标 retryable，
// 业务语义留给宿主在自己的 headers()/错误展示里处理。
//
// stream() 永不 throw。所有错误路径都先产一条事件再结束——让每个消费方各写一遍 try/catch，
// 等于把错误处理摊给所有人，不如在这里收口。
import type { ChatRequest } from '../model/message'
import type { NormalizedEvent } from '../reduce/events'
import type { Transport } from './transport'
import { normalizeDataStreamV1 } from '../normalize/datastream-v1'
import { createSseReader } from './sse-reader'

export const DATA_STREAM_HEADER = 'x-vercel-ai-ui-message-stream'
export const DATA_STREAM_VERSION = 'v1'

export interface HttpSseTransportOptions {
  url: string
  /** 每次请求现取，宿主在这里塞鉴权 / X-Timezone / X-Language。 */
  headers?: () => Record<string, string>
  /** 注入 fetch，测试用。默认 globalThis.fetch。 */
  fetch?: typeof globalThis.fetch
  now?: () => number
}

/** 取消是用户意图，映射成 abort；其余异常一律当作可重试的传输故障。 */
function toFailureEvent(err: unknown, signal: AbortSignal, receivedTime: number): NormalizedEvent {
  const aborted = signal.aborted || (typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError')
  if (aborted) {
    const reason: unknown = signal.reason
    return { kind: 'abort', reason: typeof reason === 'string' ? reason : undefined, receivedTime }
  }
  return { kind: 'error', errorText: String(err), retryable: true, receivedTime }
}

/** 关掉响应体，别让提前 break 的连接悬着。已被读取器接管或已关闭时都会抛，一律吞掉。 */
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
  // 不直接把 globalThis.fetch 取下来当函数用：浏览器里脱离 this 调用会抛 Illegal invocation
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

    // 协议版本不符就别硬解析，body 一个字节都不读
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
