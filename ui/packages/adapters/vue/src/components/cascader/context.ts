import type { CascaderGroupProps, CascaderItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CascaderContext } from './use-cascader'
import { inject, provide } from 'vue'

/** 条目自报的值，供 item-text / item-indicator 复用同一份声明；所在列、路径、禁用与标签回 collection 里查。 */
export interface CascaderItemContext {
  item: ComputedRef<CascaderItemProps>
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface CascaderGroupContext {
  group: ComputedRef<CascaderGroupProps>
}

const KEY: InjectionKey<CascaderContext> = Symbol.for('xh-cascader')
const ITEM_KEY: InjectionKey<CascaderItemContext> = Symbol.for('xh-cascader-item')
const GROUP_KEY: InjectionKey<CascaderGroupContext> = Symbol.for('xh-cascader-group')

export function provideCascader(ctx: CascaderContext): void {
  provide(KEY, ctx)
}

export function useCascaderContext(): CascaderContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Cascader 部件必须用在 XhCascaderRoot 内')
  return ctx
}

export function provideCascaderGroup(ctx: CascaderGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useCascaderGroupContext(): CascaderGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] Cascader 分组标题必须用在 XhCascaderGroup 内')
  return ctx
}

export function provideCascaderItem(ctx: CascaderItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useCascaderItemContext(): CascaderItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Cascader 条目子部件必须用在 XhCascaderItem 内')
  return ctx
}
