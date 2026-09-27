/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { GraphChartContext } from './use-graph-chart'
import { inject, provide } from 'vue'

const KEY: InjectionKey<GraphChartContext> = Symbol.for('xh-graph-chart')

export function provideGraphChart(ctx: GraphChartContext): void {
  provide(KEY, ctx)
}

export function useGraphChartContext(): GraphChartContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] GraphChart 部件必须用在 XhGraphChartRoot 内')
  return ctx
}
