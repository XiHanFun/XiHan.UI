import type { TagGroupItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TagGroupContext } from './use-tag-group'
import { inject, provide } from 'vue'

/** 条目自报的值、禁用与可摘，供 item-text / item-delete-trigger 复用同一份声明。 */
export interface TagGroupItemContext {
  item: ComputedRef<TagGroupItemProps>
}

const KEY: InjectionKey<TagGroupContext> = Symbol.for('xh-tag-group')
const ITEM_KEY: InjectionKey<TagGroupItemContext> = Symbol.for('xh-tag-group-item')

export function provideTagGroup(ctx: TagGroupContext): void {
  provide(KEY, ctx)
}

export function useTagGroupContext(): TagGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TagGroup 部件必须用在 XhTagGroupRoot 内')
  return ctx
}

export function provideTagGroupItem(ctx: TagGroupItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useTagGroupItemContext(): TagGroupItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] TagGroup 条目子部件必须用在 XhTagGroupItem 内')
  return ctx
}
