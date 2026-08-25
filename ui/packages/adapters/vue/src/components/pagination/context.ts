import type { InjectionKey } from 'vue'
import type { PaginationContext } from './use-pagination'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PaginationContext> = Symbol.for('xh-pagination')

export function providePagination(ctx: PaginationContext): void {
  provide(KEY, ctx)
}

export function usePaginationContext(): PaginationContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Pagination 部件必须用在 XhPaginationRoot 内')
  return ctx
}
