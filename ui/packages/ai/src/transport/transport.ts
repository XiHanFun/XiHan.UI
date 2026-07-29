// 传输端口：协议内核对接后端的唯一接口。
import type { ChatRequest } from '../model/message'
import type { NormalizedEvent } from '../reduce/events'

export interface Transport {
  /** 发起一次运行，返回归一化事件流，由 AbortSignal 取消。 */
  stream: (req: ChatRequest, signal: AbortSignal) => AsyncIterable<NormalizedEvent>
}
