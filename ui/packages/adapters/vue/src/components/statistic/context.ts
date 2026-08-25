import type { StatisticApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface StatisticContext {
  api: ComputedRef<StatisticApi>
}

const KEY: InjectionKey<StatisticContext> = Symbol.for('xh-statistic')

export function provideStatistic(ctx: StatisticContext): void {
  provide(KEY, ctx)
}

export function useStatisticContext(): StatisticContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Statistic 部件必须用在 XhStatisticRoot 内')
  return ctx
}
