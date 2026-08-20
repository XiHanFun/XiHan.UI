import type { ComputedRef, InjectionKey } from 'vue'
import type { HeatmapContext } from './use-heatmap'
import { inject, provide } from 'vue'

const KEY: InjectionKey<HeatmapContext> = Symbol('xh-heatmap')

/** 月块把自己的月份身份传给块内的行：一行由「哪个月 + 月内第几周」定位。 */
const MONTH_KEY: InjectionKey<ComputedRef<string>> = Symbol('xh-heatmap-month')

/** 行把自己的行身份传给行里的格子：矩阵的一格由「哪一行 + 哪一列」定位。 */
const ROW_KEY: InjectionKey<ComputedRef<string | undefined>> = Symbol('xh-heatmap-row')

export function provideHeatmap(ctx: HeatmapContext): void {
  provide(KEY, ctx)
}

export function useHeatmapContext(): HeatmapContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Heatmap 部件必须用在 XhHeatmapRoot 内')
  return ctx
}

export function provideHeatmapMonth(month: ComputedRef<string>): void {
  provide(MONTH_KEY, month)
}

/** 没写在月块里就没有月份身份，行自己再从 props 上找。 */
export function useHeatmapMonth(): ComputedRef<string> | null {
  return inject(MONTH_KEY, null)
}

export function provideHeatmapRow(row: ComputedRef<string | undefined>): void {
  provide(ROW_KEY, row)
}

export function useHeatmapRow(): ComputedRef<string | undefined> | null {
  return inject(ROW_KEY, null)
}
