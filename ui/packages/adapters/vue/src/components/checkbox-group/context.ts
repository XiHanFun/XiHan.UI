import type { CheckboxGroupItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CheckboxGroupContext } from './use-checkbox-group'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 indicator / item-text 这类子部件复用同一份声明。 */
export interface CheckboxGroupItemContext {
  item: ComputedRef<CheckboxGroupItemProps>
}

const KEY: InjectionKey<CheckboxGroupContext> = Symbol.for('xh-checkbox-group')
const ITEM_KEY: InjectionKey<CheckboxGroupItemContext> = Symbol.for('xh-checkbox-group-item')

export function provideCheckboxGroup(ctx: CheckboxGroupContext): void {
  provide(KEY, ctx)
}

export function useCheckboxGroupContext(): CheckboxGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] CheckboxGroup 部件必须用在 XhCheckboxGroupRoot 内')
  return ctx
}

export function provideCheckboxGroupItem(ctx: CheckboxGroupItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useCheckboxGroupItemContext(): CheckboxGroupItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] CheckboxGroup 条目子部件必须用在 XhCheckboxGroupItem 内')
  return ctx
}
