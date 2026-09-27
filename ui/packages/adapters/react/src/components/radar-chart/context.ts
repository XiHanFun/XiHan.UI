/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { RadarChartContext } from './use-radar-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<RadarChartContext | undefined>(undefined)

export const RadarChartProvider = Ctx

export function useRadarChartContext(): RadarChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhRadarChart 的部件要放在 XhRadarChartRoot 里')
  return ctx
}
