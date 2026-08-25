import type { InjectionKey } from 'vue'
import type { TooltipContext } from './use-tooltip'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TooltipContext> = Symbol.for('xh-tooltip')

export function provideTooltip(ctx: TooltipContext): void {
  provide(KEY, ctx)
}

export function useTooltipContext(): TooltipContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tooltip 部件必须用在 XhTooltipRoot 内')
  return ctx
}
