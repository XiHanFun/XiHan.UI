/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FunnelChartContext } from './use-funnel-chart'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FunnelChartContext> = Symbol.for('xh-funnel-chart')

export function provideFunnelChart(ctx: FunnelChartContext): void {
  provide(KEY, ctx)
}

export function useFunnelChartContext(): FunnelChartContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FunnelChart 部件必须用在 XhFunnelChartRoot 内')
  return ctx
}
