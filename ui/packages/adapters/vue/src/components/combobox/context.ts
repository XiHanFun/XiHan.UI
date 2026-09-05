import type { ComboboxGroupProps, ComboboxItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ComboboxContext } from './use-combobox'
import { inject, provide } from 'vue'

/** 候选自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
export interface ComboboxItemContext {
  item: ComputedRef<ComboboxItemProps>
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface ComboboxItemGroupContext {
  group: ComputedRef<ComboboxGroupProps>
}

const KEY: InjectionKey<ComboboxContext> = Symbol.for('xh-combobox')
const ITEM_KEY: InjectionKey<ComboboxItemContext> = Symbol.for('xh-combobox-item')
const GROUP_KEY: InjectionKey<ComboboxItemGroupContext> = Symbol.for('xh-combobox-item-group')

export function provideCombobox(ctx: ComboboxContext): void {
  provide(KEY, ctx)
}

export function useComboboxContext(): ComboboxContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Combobox 部件必须用在 XhComboboxRoot 内')
  return ctx
}

export function provideComboboxItem(ctx: ComboboxItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useComboboxItemContext(): ComboboxItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Combobox 候选子部件必须用在 XhComboboxItem 内')
  return ctx
}

export function provideComboboxItemGroup(ctx: ComboboxItemGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useComboboxItemGroupContext(): ComboboxItemGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] Combobox 分组标题必须用在 XhComboboxGroup 内')
  return ctx
}
