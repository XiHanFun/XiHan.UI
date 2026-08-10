import type { DynamicInputItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { DynamicInputContext } from './use-dynamic-input'
import { inject, provide } from 'vue'

/** 行自报的下标，供 item-content / item-action 与三个把手复用同一份声明。 */
export interface DynamicInputItemContext {
  item: ComputedRef<DynamicInputItemProps>
}

const KEY: InjectionKey<DynamicInputContext> = Symbol('xh-dynamic-input')
const ITEM_KEY: InjectionKey<DynamicInputItemContext> = Symbol('xh-dynamic-input-item')

export function provideDynamicInput(ctx: DynamicInputContext): void {
  provide(KEY, ctx)
}

export function useDynamicInputContext(): DynamicInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] DynamicInput 部件必须用在 XhDynamicInputRoot 内')
  return ctx
}

export function provideDynamicInputItem(ctx: DynamicInputItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useDynamicInputItemContext(): DynamicInputItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] DynamicInput 行内部件必须用在 XhDynamicInputItem 内')
  return ctx
}
