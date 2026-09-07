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

/** 条目把自己的身份传给 item-label：标签自己不必再写一遍 id。 */
export interface MessageFeedItemContext {
  id: string
  /**
   * 登记一份渲出来的 item-label，返回撤销登记的函数。
   * 条目的可访问名据此决定指过去还是用文案兜底——指向一个没渲出来的 id 会让读屏读空。
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
