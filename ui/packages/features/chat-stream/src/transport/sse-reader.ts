// SSE 行协议解析：只把字节流切成帧，不涉及任何上层协议语义。
import { warn } from '@xihan-ui/core'

/** 行缓冲字符数上限，超出即丢弃当前残帧。 */
const MAX_BUFFER_CHARS = 8 * 1024 * 1024

/** 一帧 SSE 事件。 */
export interface RawFrame {
  /** SSE `event:` 字段，缺省为 undefined。 */
  readonly event?: string
  /** 多行 `data:` 以 '\n' 拼接后的载荷。 */
  readonly data: string
  readonly id?: string
  /** 收到该帧的本地毫秒时间戳。 */
  readonly receivedTime: number
}

export interface SseReaderOptions {
  /** 自定义时钟，默认 Date.now。 */
  now?: () => number
}

interface SplitResult {
  readonly lines: string[]
  readonly rest: string
}

/**
 * 按 \r\n / \n / \r 切分行，可混用。
 * 末尾孤立的 \r 留在 rest 里等后续数据；final=true 时按行尾定案。
 */
function splitLines(buffer: string, final = false): SplitResult {
  const lines: string[] = []
  let start = 0
  let i = 0
  while (i < buffer.length) {
    const ch = buffer[i]
    if (ch === '\n') {
      lines.push(buffer.slice(start, i))
      i += 1
      start = i
      continue
    }
    if (ch === '\r') {
      if (i === buffer.length - 1 && !final)
        break
      lines.push(buffer.slice(start, i))
      i += buffer[i + 1] === '\n' ? 2 : 1
      start = i
      continue
    }
    i += 1
  }
  return { lines, rest: buffer.slice(start) }
}

/** 把字节流读成一帧一帧，以空行分帧；流结束时未被空行收尾的残帧丢弃。 */
export async function* createSseReader(
  body: ReadableStream<Uint8Array>,
  options?: SseReaderOptions,
): AsyncGenerator<RawFrame> {
  const now = options?.now ?? Date.now
  const reader = body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let dataLines: string[] = []
  let eventName: string | undefined
  let eventId: string | undefined

  // 消费一批切好的行，产出其中完整的帧
  function* consume(lines: readonly string[]): Generator<RawFrame> {
    for (const line of lines) {
      // 空行分帧，只有攒到过 data 字段才产出
      if (line === '') {
        if (dataLines.length > 0)
          yield { event: eventName, data: dataLines.join('\n'), id: eventId, receivedTime: now() }
        dataLines = []
        eventName = undefined
        eventId = undefined
        continue
      }

      // 以 ':' 开头的注释行整行丢弃
      if (line.startsWith(':'))
        continue

      const colon = line.indexOf(':')
      const field = colon === -1 ? line : line.slice(0, colon)
      const raw = colon === -1 ? '' : line.slice(colon + 1)
      // 冒号后至多去掉一个空格，其余属于载荷
      const value = raw.startsWith(' ') ? raw.slice(1) : raw

      if (field === 'data')
        dataLines.push(value)
      else if (field === 'event')
        eventName = value
      else if (field === 'id')
        eventId = value
      // retry 与未知字段忽略
    }
  }

  try {
    while (true) {
      const { done, value: chunk } = await reader.read()
      if (done) {
        // 流已结束，末尾孤立的 \r 按行尾定案
        yield* consume(splitLines(buffer, true).lines)
        break
      }

      buffer += decoder.decode(chunk, { stream: true })
      // 缓冲超限说明始终没等到行尾，丢弃残料重新对齐
      if (buffer.length > MAX_BUFFER_CHARS) {
        warn(false, `ai: SSE 行缓冲超过 ${MAX_BUFFER_CHARS} 字符仍未见行尾，已丢弃当前残帧`)
        buffer = ''
        continue
      }
      const split = splitLines(buffer)
      buffer = split.rest
      yield* consume(split.lines)
    }
  }
  finally {
    // 消费方提前 break 时关掉上游
    try {
      await reader.cancel()
    }
    catch {
      // 流已关闭，忽略
    }
    reader.releaseLock()
  }
}
