/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { RadarChartContext } from './use-radar-chart'
import { inject, provide } from 'vue'

const KEY: InjectionKey<RadarChartContext> = Symbol.for('xh-radar-chart')

export function provideRadarChart(ctx: RadarChartContext): void {
  provide(KEY, ctx)
}

export function useRadarChartContext(): RadarChartContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] RadarChart 部件必须用在 XhRadarChartRoot 内')
  return ctx
}
