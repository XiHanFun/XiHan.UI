import type { InjectionKey } from 'vue'
import type { EmptyStateContext } from './use-empty-state'
import { inject, provide } from 'vue'

const KEY: InjectionKey<EmptyStateContext> = Symbol.for('xh-empty-state')

export function provideEmptyState(ctx: EmptyStateContext): void {
  provide(KEY, ctx)
}

export function useEmptyStateContext(): EmptyStateContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] EmptyState 部件必须用在 XhEmptyStateRoot 内')
  return ctx
}
