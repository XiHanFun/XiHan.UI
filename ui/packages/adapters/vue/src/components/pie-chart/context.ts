/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { PieChartContext } from './use-pie-chart'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PieChartContext> = Symbol.for('xh-pie-chart')

export function providePieChart(ctx: PieChartContext): void {
  provide(KEY, ctx)
}

export function usePieChartContext(): PieChartContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] PieChart 部件必须用在 XhPieChartRoot 内')
  return ctx
}
