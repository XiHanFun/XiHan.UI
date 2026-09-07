import type { HeatmapContext } from './use-heatmap'
import { createContext, useContext } from 'react'

const Ctx = createContext<HeatmapContext | undefined>(undefined)

/** 月块把自己的月份身份传给块内的行：一行由「哪个月 + 月内第几周」定位。 */
const MonthCtx = createContext<string | undefined>(undefined)

/** 行把自己的行身份传给行里的格子：矩阵的一格由「哪一行 + 哪一列」定位。 */
const RowCtx = createContext<string | undefined>(undefined)

export const HeatmapProvider = Ctx
export const HeatmapMonthProvider = MonthCtx
export const HeatmapRowProvider = RowCtx

export function useHeatmapContext(): HeatmapContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhHeatmap 的部件要放在 XhHeatmapRoot 里')
  return ctx
}

/** 没写在月块里就没有月份身份，行自己再从 props 上找。 */
export function useHeatmapMonth(): string | undefined {
  return useContext(MonthCtx)
}

export function useHeatmapRow(): string | undefined {
  return useContext(RowCtx)
}
