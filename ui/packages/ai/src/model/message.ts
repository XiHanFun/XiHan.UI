// 消息与请求模型。
import type { UIMessagePart } from './part-kinds'
import type { MessageMetadata } from './usage'

export type Role = 'system' | 'user' | 'assistant'

export interface UIMessage {
  readonly id: string
  readonly role: Role
  /**
   * 有序内容块。渲染顺序 = 数组顺序，不是并发块的到达顺序。
   *
   * 不做成 `Record<BlockKey, Part>`：对象的整数样式键会被引擎重排，而并发块的逻辑顺序由
   * start 事件的到达序决定，不是 key 字典序。并发寻址交给下标表，两者职责分离。
   */
  readonly parts: readonly UIMessagePart[]
  readonly metadata?: MessageMetadata
}

export interface ChatRequest {
  readonly messages: readonly UIMessage[]
  readonly threadId?: string
  /** 宿主自定义字段的唯一收口，整体并进 POST body。不用索引签名——它会把拼写错误一并放行。 */
  readonly body?: Readonly<Record<string, unknown>>
}
