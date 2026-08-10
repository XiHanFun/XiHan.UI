import type { MentionItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { MentionContext } from './use-mention'
import { inject, provide } from 'vue'

/** 候选自报的值与禁用，供 item-text 复用同一份声明。 */
export interface MentionItemContext {
  item: ComputedRef<MentionItemProps>
}

const KEY: InjectionKey<MentionContext> = Symbol('xh-mention')
const ITEM_KEY: InjectionKey<MentionItemContext> = Symbol('xh-mention-item')

export function provideMention(ctx: MentionContext): void {
  provide(KEY, ctx)
}

export function useMentionContext(): MentionContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Mention 部件必须用在 XhMentionRoot 内')
  return ctx
}

export function provideMentionItem(ctx: MentionItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useMentionItemContext(): MentionItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Mention 候选子部件必须用在 XhMentionItem 内')
  return ctx
}
