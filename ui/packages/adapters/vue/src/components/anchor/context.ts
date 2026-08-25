import type { InjectionKey } from 'vue'
import type { AnchorContext } from './use-anchor'
import { inject, provide } from 'vue'

const KEY: InjectionKey<AnchorContext> = Symbol.for('xh-anchor')

export function provideAnchor(ctx: AnchorContext): void {
  provide(KEY, ctx)
}

export function useAnchorContext(): AnchorContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Anchor 部件必须用在 XhAnchorRoot 内')
  return ctx
}
