import type { InjectionKey } from 'vue'
import type { HeatmapContext } from './use-heatmap'
import { inject, provide } from 'vue'

const KEY: InjectionKey<HeatmapContext> = Symbol('xh-heatmap')

export function provideHeatmap(ctx: HeatmapContext): void {
  provide(KEY, ctx)
}

export function useHeatmapContext(): HeatmapContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Heatmap 部件必须用在 XhHeatmapRoot 内')
  return ctx
}
