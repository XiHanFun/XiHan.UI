/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SankeyChartContext } from './use-sankey-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<SankeyChartContext | undefined>(undefined)

export const SankeyChartProvider = Ctx

export function useSankeyChartContext(): SankeyChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSankeyChart 的部件要放在 XhSankeyChartRoot 里')
  return ctx
}
