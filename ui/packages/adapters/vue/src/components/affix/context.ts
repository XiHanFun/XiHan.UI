import type { InjectionKey } from 'vue'
import type { AffixContext } from './use-affix'
import { inject, provide } from 'vue'

const KEY: InjectionKey<AffixContext> = Symbol.for('xh-affix')

export function provideAffix(ctx: AffixContext): void {
  provide(KEY, ctx)
}

export function useAffixContext(): AffixContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Affix 部件必须用在 XhAffixRoot 内')
  return ctx
}
