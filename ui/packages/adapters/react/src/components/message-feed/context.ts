/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { MessageFeedContext } from './use-message-feed'
import { createContext, useContext } from 'react'

const Ctx = createContext<MessageFeedContext | undefined>(undefined)

export const MessageFeedProvider = Ctx

export function useMessageFeedContext(): MessageFeedContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhMessageFeed 的部件要放在 XhMessageFeedRoot 里')
  return ctx
}

/** 条目把自己的身份传给 item-label：标签自身不必再写一遍 id。 */
export interface MessageFeedItemContext {
  id: string
  /**
   * 登记一份已渲染的 item-label，返回撤销登记的函数。
   * 条目的可访问名据此决定指向它还是使用文案兜底：指向一个未渲染的 id 会使读屏读空。
   */
  registerLabel: () => () => void
}

const ItemCtx = createContext<MessageFeedItemContext | undefined>(undefined)

export const MessageFeedItemProvider = ItemCtx

export function useMessageFeedItemContext(): MessageFeedItemContext {
  const ctx = useContext(ItemCtx)
  if (!ctx)
    throw new Error('XhMessageFeedItemLabel 要放在 XhMessageFeedItem 里')
  return ctx
}
