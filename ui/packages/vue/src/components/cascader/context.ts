import type { CascaderItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CascaderContext } from './use-cascader'
import { inject, provide } from 'vue'

/**
 * 条目自报的值，供 item-text / item-indicator 复用同一份声明。
 * 只报值：所在列、整条路径、禁用与标签都回 collection 里查，作者不必在标记里抄第二遍。
 */
export interface CascaderItemContext {
  item: ComputedRef<CascaderItemProps>
}

const KEY: InjectionKey<CascaderContext> = Symbol('xh-cascader')
const ITEM_KEY: InjectionKey<CascaderItemContext> = Symbol('xh-cascader-item')

export function provideCascader(ctx: CascaderContext): void {
  provide(KEY, ctx)
}

export function useCascaderContext(): CascaderContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Cascader 部件必须用在 XhCascaderRoot 内')
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
