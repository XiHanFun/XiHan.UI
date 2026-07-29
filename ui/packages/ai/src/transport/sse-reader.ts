// SSE 行协议解析。零协议知识：只把字节流切成帧，不认识任何 AI 方言，因此可独立单测。
//
// 不用浏览器原生 EventSource：它只支持 GET（发不了整段对话历史）、不能自定义请求头，
// 断线自动重连的语义也与"一次性生成流"相冲突。
import { warn } from '@xihan-ui/core'

/** 行缓冲上限。单帧再大也不该逼近这个数，撞上说明对端根本没在发合法的 SSE。 */
const MAX_BUFFER_CHARS = 8 * 1024 * 1024

/** 一帧 SSE 事件。 */
export interface RawFrame {
  /** SSE `event:` 字段，缺省为 undefined。 */
  readonly event?: string
  /** 多行 `data:` 以 '\n' 拼接后的载荷。 */
  readonly data: string
  readonly id?: string
  /** 收到该帧的本地毫秒。整条管道的时间戳都从这里来。 */
  readonly receivedTime: number
}

export interface SseReaderOptions {
  /** 注入时钟，测试用。默认 Date.now。 */
  now?: () => number
}

interface SplitResult {
  readonly lines: string[]
  readonly rest: string
}

/**
 * 按 \r\n / \n / \r 三种行尾切分，混用也照切。
 * 缓冲区末尾的孤立 \r 是歧义的（可能是被切在两个 chunk 中间的 \r\n），
 * 先留在 rest 里等下一块数据到了再判。
 *
 * final=true 表示流已结束：不会再有 \n 跟上来，末尾的 \r 按行尾定案。
 * 少了这一步，纯 \r 行尾的流最后一帧会连同收尾空行一起烂在缓冲区里。
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

/**
 * 把字节流读成一帧一帧。空行才是帧分隔符；流结束时缓冲区里没被空行收尾的残帧直接丢弃
 * —— 半个 JSON 解析出来的东西比没有更糟。
 */
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

  // 消费一批切好的行。抽成生成器，让读取循环与流结束时的收尾复用同一段解析逻辑。
  function* consume(lines: readonly string[]): Generator<RawFrame> {
    for (const line of lines) {
      // 空行 = 分帧。只有攒到过 data: 才发帧：光有 event: 没载荷的帧对下游毫无意义
      if (line === '') {
        if (dataLines.length > 0)
          yield { event: eventName, data: dataLines.join('\n'), id: eventId, receivedTime: now() }
        dataLines = []
        eventName = undefined
        eventId = undefined
        continue
      }

      // 以 ':' 开头的是注释行，服务端心跳走的就是这条，整行丢弃
      if (line.startsWith(':'))
        continue

      const colon = line.indexOf(':')
      const field = colon === -1 ? line : line.slice(0, colon)
      const raw = colon === -1 ? '' : line.slice(colon + 1)
      // 冒号后至多吃掉一个空格，多出来的空格属于载荷
      const value = raw.startsWith(' ') ? raw.slice(1) : raw

      if (field === 'data')
        dataLines.push(value)
      else if (field === 'event')
        eventName = value
      else if (field === 'id')
        eventId = value
      // retry 与未知字段一律忽略：本读取器不做重连
    }
  }

  try {
    while (true) {
      const { done, value: chunk } = await reader.read()
      if (done) {
        // 末尾的孤立 \r 到这里才不再有歧义，按行尾定案。
        // 仍没被空行收尾的残帧依旧留在 rest 里，consume 见不到也就不会产出。
        yield* consume(splitLines(buffer, true).lines)
        break
      }

      buffer += decoder.decode(chunk, { stream: true })
      // 一直收不到行尾说明对端在灌流水字节（坏网关、错协议、或者干脆是攻击），
      // 再攒下去就是拿内存换一个永远拼不出的帧。丢掉这段残料重新对齐，别把页面拖死
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
    // 消费方提前 break 时把上游关掉，别让连接悬着；流已正常结束时这两步都是空操作
    try {
      await reader.cancel()
    }
    catch {
      // 流已关闭，忽略
    }
    reader.releaseLock()
  }
}
