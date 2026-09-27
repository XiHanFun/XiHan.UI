/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { HierarchyChartContext } from './use-hierarchy-chart'
import { inject, provide } from 'vue'

const KEY: InjectionKey<HierarchyChartContext> = Symbol.for('xh-hierarchy-chart')

export function provideHierarchyChart(ctx: HierarchyChartContext): void {
  provide(KEY, ctx)
}

export function useHierarchyChartContext(): HierarchyChartContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] HierarchyChart 部件必须用在 XhHierarchyChartRoot 内')
  return ctx
}
