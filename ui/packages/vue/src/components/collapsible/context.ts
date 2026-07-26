import type { InjectionKey } from 'vue'
import type { CollapsibleContext } from './use-collapsible'
import { inject, provide } from 'vue'

const KEY: InjectionKey<CollapsibleContext> = Symbol('xh-collapsible')

export function provideCollapsible(ctx: CollapsibleContext): void {
  provide(KEY, ctx)
}

export function useCollapsibleContext(): CollapsibleContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Collapsible 部件必须用在 XhCollapsibleRoot 内')
  return ctx
}
