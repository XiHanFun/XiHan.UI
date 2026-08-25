import type { SelectItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { SelectContext } from './use-select'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
export interface SelectItemContext {
  item: ComputedRef<SelectItemProps>
}

const KEY: InjectionKey<SelectContext> = Symbol.for('xh-select')
const ITEM_KEY: InjectionKey<SelectItemContext> = Symbol.for('xh-select-item')

export function provideSelect(ctx: SelectContext): void {
  provide(KEY, ctx)
}

export function useSelectContext(): SelectContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Select 部件必须用在 XhSelectRoot 内')
  return ctx
}

export function provideSelectItem(ctx: SelectItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useSelectItemContext(): SelectItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Select 条目子部件必须用在 XhSelectItem 内')
  return ctx
}

/** 标签自报的值，供 item-delete-trigger 复用同一份声明。 */
export interface SelectTagContext {
  value: () => string
}

const TAG_KEY: InjectionKey<SelectTagContext> = Symbol.for('xh-select-tag')

export function provideSelectTag(ctx: SelectTagContext): void {
  provide(TAG_KEY, ctx)
}

export function useSelectTagContext(): SelectTagContext {
  const ctx = inject(TAG_KEY, null)
  if (!ctx)
    throw new Error('[xh] Select 标签子部件必须用在 XhSelectTag 内')
  return ctx
}
