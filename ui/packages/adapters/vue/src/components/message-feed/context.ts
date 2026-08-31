import type { InjectionKey, Ref } from 'vue'
import type { MessageFeedContext } from './use-message-feed'
import { inject, provide } from 'vue'

const KEY: InjectionKey<MessageFeedContext> = Symbol.for('xh-message-feed')

/** 条目把自己的身份传给 item-label：标签自己不必再写一遍 id。 */
export interface MessageFeedItemContext {
  id: () => string
  /**
   * 这条消息里作者渲出来的 item-label 份数，由标签自己登记。
   * 条目的可访问名据此决定指过去还是用文案兜底——指向一个没渲出来的 id 会让读屏读空。
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
