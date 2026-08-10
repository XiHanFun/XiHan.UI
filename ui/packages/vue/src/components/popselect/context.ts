import type { PopselectItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { PopselectContext } from './use-popselect'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
export interface PopselectItemContext {
  item: ComputedRef<PopselectItemProps>
}

const KEY: InjectionKey<PopselectContext> = Symbol('xh-popselect')
const ITEM_KEY: InjectionKey<PopselectItemContext> = Symbol('xh-popselect-item')

export function providePopselect(ctx: PopselectContext): void {
  provide(KEY, ctx)
}

export function usePopselectContext(): PopselectContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Popselect 部件必须用在 XhPopselectRoot 内')
  return ctx
}

export function providePopselectItem(ctx: PopselectItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function usePopselectItemContext(): PopselectItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Popselect 条目子部件必须用在 XhPopselectItem 内')
  return ctx
}
