import type { TagsInputItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TagsInputContext } from './use-tags-input'
import { inject, provide } from 'vue'

/** 标签自报的值，供 item-preview / item-text / 删除按钮 / 编辑框复用同一份声明。 */
export interface TagsInputItemContext {
  item: ComputedRef<TagsInputItemProps>
}

const KEY: InjectionKey<TagsInputContext> = Symbol('xh-tags-input')
const ITEM_KEY: InjectionKey<TagsInputItemContext> = Symbol('xh-tags-input-item')

export function provideTagsInput(ctx: TagsInputContext): void {
  provide(KEY, ctx)
}

export function useTagsInputContext(): TagsInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TagsInput 部件必须用在 XhTagsInputRoot 内')
  return ctx
}

export function provideTagsInputItem(ctx: TagsInputItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useTagsInputItemContext(): TagsInputItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] TagsInput 标签子部件必须用在 XhTagsInputItem 内')
  return ctx
}
