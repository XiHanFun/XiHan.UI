/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { PieChartContext } from './use-pie-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<PieChartContext | undefined>(undefined)

export const PieChartProvider = Ctx

export function usePieChartContext(): PieChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPieChart 的部件要放在 XhPieChartRoot 里')
  return ctx
}
