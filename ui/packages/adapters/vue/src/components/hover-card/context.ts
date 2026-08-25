import type { InjectionKey } from 'vue'
import type { HoverCardContext } from './use-hover-card'
import { inject, provide } from 'vue'

const KEY: InjectionKey<HoverCardContext> = Symbol.for('xh-hover-card')

export function provideHoverCard(ctx: HoverCardContext): void {
  provide(KEY, ctx)
}

export function useHoverCardContext(): HoverCardContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] HoverCard 部件必须用在 XhHoverCardRoot 内')
  return ctx
}
