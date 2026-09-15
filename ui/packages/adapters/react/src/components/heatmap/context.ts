/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { HeatmapContext } from './use-heatmap'
import { createContext, useContext } from 'react'

const Ctx = createContext<HeatmapContext | undefined>(undefined)

/** 月块把自己的月份身份传给块内的行：一行由所属月份与月内周序定位。 */
const MonthCtx = createContext<string | undefined>(undefined)

/** 行把自己的行身份传给行内的格子：矩阵的一格由行与列定位。 */
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

/** 未写在月块中时没有月份身份，行自行从 props 上查找。 */
export function useHeatmapMonth(): string | undefined {
  return useContext(MonthCtx)
}

export function useHeatmapRow(): string | undefined {
  return useContext(RowCtx)
}
