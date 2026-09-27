/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { HierarchyChartContext } from './use-hierarchy-chart'
import { createContext, useContext } from 'react'

const Ctx = createContext<HierarchyChartContext | undefined>(undefined)

export const HierarchyChartProvider = Ctx

export function useHierarchyChartContext(): HierarchyChartContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhHierarchyChart 的部件要放在 XhHierarchyChartRoot 里')
  return ctx
}
