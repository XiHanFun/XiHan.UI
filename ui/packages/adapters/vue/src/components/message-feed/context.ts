/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey, Ref } from 'vue'
import type { MessageFeedContext } from './use-message-feed'
import { inject, provide } from 'vue'

const KEY: InjectionKey<MessageFeedContext> = Symbol.for('xh-message-feed')

/** 条目把自己的身份传给 item-label：标签自身不必再写一遍 id。 */
export interface MessageFeedItemContext {
  id: () => string
  /**
   * 该条消息中作者渲染的 item-label 数量，由标签自行登记。
   * 条目的可访问名据此决定指向它还是使用文案兜底：指向一个未渲染的 id 会使读屏读空。
   */
  labelCount: Ref<number>
}

const ITEM_KEY: InjectionKey<MessageFeedItemContext> = Symbol.for('xh-message-feed-item')

export function provideMessageFeed(ctx: MessageFeedContext): void {
  provide(KEY, ctx)
}

export function useMessageFeedContext(): MessageFeedContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] MessageFeed 部件必须用在 XhMessageFeedRoot 内')
  return ctx
}

export function provideMessageFeedItem(ctx: MessageFeedItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useMessageFeedItemContext(): MessageFeedItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] MessageFeedItemLabel 必须用在 XhMessageFeedItem 内')
  return ctx
}
