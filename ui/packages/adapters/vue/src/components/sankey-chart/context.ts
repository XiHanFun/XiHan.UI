/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { SankeyChartContext } from './use-sankey-chart'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SankeyChartContext> = Symbol.for('xh-sankey-chart')

export function provideSankeyChart(ctx: SankeyChartContext): void {
  provide(KEY, ctx)
}

export function useSankeyChartContext(): SankeyChartContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] SankeyChart 部件必须用在 XhSankeyChartRoot 内')
  return ctx
}
