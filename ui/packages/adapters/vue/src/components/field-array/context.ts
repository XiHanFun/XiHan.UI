import type { FieldArrayItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { FieldArrayContext } from './use-field-array'
import { inject, provide } from 'vue'

/** 行自报的下标，供 item-content / item-action 与三个把手复用同一份声明。 */
export interface FieldArrayItemContext {
  item: ComputedRef<FieldArrayItemProps>
}

const KEY: InjectionKey<FieldArrayContext> = Symbol.for('xh-field-array')
const ITEM_KEY: InjectionKey<FieldArrayItemContext> = Symbol.for('xh-field-array-item')

export function provideFieldArray(ctx: FieldArrayContext): void {
  provide(KEY, ctx)
}

export function useFieldArrayContext(): FieldArrayContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FieldArray 部件必须用在 XhFieldArrayRoot 内')
  return ctx
}

export function provideFieldArrayItem(ctx: FieldArrayItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useFieldArrayItemContext(): FieldArrayItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] FieldArray 行内部件必须用在 XhFieldArrayItem 内')
  return ctx
}
