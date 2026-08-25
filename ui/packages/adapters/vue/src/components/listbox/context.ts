import type { ListboxItemGroupProps, ListboxItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ListboxContext } from './use-listbox'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
export interface ListboxItemContext {
  item: ComputedRef<ListboxItemProps>
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface ListboxItemGroupContext {
  group: ComputedRef<ListboxItemGroupProps>
}

const KEY: InjectionKey<ListboxContext> = Symbol.for('xh-listbox')
const ITEM_KEY: InjectionKey<ListboxItemContext> = Symbol.for('xh-listbox-item')
const GROUP_KEY: InjectionKey<ListboxItemGroupContext> = Symbol.for('xh-listbox-item-group')

export function provideListbox(ctx: ListboxContext): void {
  provide(KEY, ctx)
}

export function useListboxContext(): ListboxContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Listbox 部件必须用在 XhListboxRoot 内')
  return ctx
}

export function provideListboxItem(ctx: ListboxItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useListboxItemContext(): ListboxItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Listbox 条目子部件必须用在 XhListboxItem 内')
  return ctx
}

export function provideListboxItemGroup(ctx: ListboxItemGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useListboxItemGroupContext(): ListboxItemGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] Listbox 分组标题必须用在 XhListboxItemGroup 内')
  return ctx
}
