/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FunnelChartContext } from './use-funnel-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<FunnelChartContext | undefined>(undefined)

export const FunnelChartProvider = Ctx

export function useFunnelChartContext(): FunnelChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFunnelChart 的部件要放在 XhFunnelChartRoot 里')
  return ctx
}
