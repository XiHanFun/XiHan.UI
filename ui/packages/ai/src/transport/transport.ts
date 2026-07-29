// 传输端口。协议内核只认这一个接口，具体是 HTTP+SSE 还是别的什么由实现方决定。
import type { ChatRequest } from '../model/message'
import type { NormalizedEvent } from '../reduce/events'

export interface Transport {
  /** 发起一次运行；返回归一化事件流。取消由 AbortSignal 承载。 */
  stream: (req: ChatRequest, signal: AbortSignal) => AsyncIterable<NormalizedEvent>
}
