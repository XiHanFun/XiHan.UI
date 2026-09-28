/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 消息与请求模型。
import type { UIMessagePart } from './part-kinds'
import type { MessageMetadata } from './usage'

export type Role = 'system' | 'user' | 'assistant'

/**
 * 助手消息的结束方式。
 *
 * - `streaming`：仍在生成。
 * - `complete`：服务端正常收尾。
 * - `aborted`：被 stop 截断，或流没等到收尾就断了；可以续写。
 * - `error`：运行失败，消息里带着 ErrorPart；可以重试。
 */
export type MessageStatus = 'streaming' | 'complete' | 'aborted' | 'error'

export interface UIMessage {
  readonly id: string
  readonly role: Role
  /** 有序内容块，渲染顺序等于数组顺序。 */
  readonly parts: readonly UIMessagePart[]
  readonly metadata?: MessageMetadata
  /**
   * 会话树里的父消息 id，会话的第一条为 null。
   *
   * 会话是一棵树而不是一条线：同一 parentId 下的多条消息互为分支——重新生成得到的是
   * 同一条提问下的另一条候选回复，编辑后重发得到的是同一位置上的另一条提问。
   * 界面上显示的是从根往下、每个分叉取当前选中那一支连成的一条路径。
   *
   * 缺席时按所在数组的前一条算，手写的线性历史不必逐条填写。
   */
  readonly parentId?: string | null
  /** 助手消息的结束方式；用户与系统消息不写。 */
  readonly status?: MessageStatus
}

/**
 * 一条用户消息的内容：纯文本是 `[{ type: 'text', text }]` 的简写；
 * 带附件时写成 parts，附件是 FilePart，与 UIMessage 的 parts 同形。
 */
export type MessageContent = string | readonly UIMessagePart[]

/** 一次运行的起因，随请求一并交给服务端。 */
export type ChatTrigger = 'submit' | 'regenerate' | 'retry' | 'edit' | 'continue'

export interface ChatRequest {
  /**
   * 本次运行的上下文：从会话第一条到本轮回复的父消息为止的那条路径。
   * 续写时最后一条就是要接着写的那条助手消息。
   */
  readonly messages: readonly UIMessage[]
  readonly threadId?: string
  /** 宿主自定义字段，整体并进 POST body。 */
  readonly body?: Readonly<Record<string, unknown>>
  /** 本次运行的起因；缺席等同于 `submit`。 */
  readonly trigger?: ChatTrigger
  /**
   * 起因针对的那条消息：重新生成、重试与续写是那条助手消息，编辑是被改写的那条用户消息。
   * submit 不写。
   */
  readonly messageId?: string
}
