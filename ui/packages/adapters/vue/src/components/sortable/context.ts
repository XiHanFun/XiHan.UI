import type { InjectionKey } from 'vue'
import type { SortableContext } from './use-sortable'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SortableContext> = Symbol.for('xh-sortable')

export function provideSortable(ctx: SortableContext): void {
  provide(KEY, ctx)
}

export function useSortableContext(): SortableContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Sortable 部件必须用在 XhSortableRoot 内')
  return ctx
}
