// 消息与请求模型。
import type { UIMessagePart } from './part-kinds'
import type { MessageMetadata } from './usage'

export type Role = 'system' | 'user' | 'assistant'

export interface UIMessage {
  readonly id: string
  readonly role: Role
  /** 有序内容块，渲染顺序等于数组顺序。 */
  readonly parts: readonly UIMessagePart[]
  readonly metadata?: MessageMetadata
}

export interface ChatRequest {
  readonly messages: readonly UIMessage[]
  readonly threadId?: string
  /** 宿主自定义字段，整体并进 POST body。 */
  readonly body?: Readonly<Record<string, unknown>>
}
