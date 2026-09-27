/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { GraphChartContext } from './use-graph-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<GraphChartContext | undefined>(undefined)

export const GraphChartProvider = Ctx

export function useGraphChartContext(): GraphChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhGraphChart 的部件要放在 XhGraphChartRoot 里')
  return ctx
}
