import type { RadioGroupItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { RadioGroupContext } from './use-radio-group'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 item-text / indicator 这类子部件复用同一份声明。 */
export interface RadioGroupItemContext {
  item: ComputedRef<RadioGroupItemProps>
}

const KEY: InjectionKey<RadioGroupContext> = Symbol('xh-radio-group')
const ITEM_KEY: InjectionKey<RadioGroupItemContext> = Symbol('xh-radio-group-item')

export function provideRadioGroup(ctx: RadioGroupContext): void {
  provide(KEY, ctx)
}

export function useRadioGroupContext(): RadioGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] RadioGroup 部件必须用在 XhRadioGroupRoot 内')
  return ctx
}

export function provideRadioGroupItem(ctx: RadioGroupItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useRadioGroupItemContext(): RadioGroupItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] RadioGroup 条目子部件必须用在 XhRadioGroupItem 内')
  return ctx
}
