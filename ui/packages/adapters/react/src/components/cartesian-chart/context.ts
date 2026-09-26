/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CartesianChartContext } from './use-cartesian-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<CartesianChartContext | undefined>(undefined)

export const CartesianChartProvider = Ctx

export function useCartesianChartContext(): CartesianChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCartesianChart 的部件要放在 XhCartesianChartRoot 里')
  return ctx
}
