/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 摘要模型：引擎算事实（最值、首末、变化率），这里按图表的格式把键与数值写成文字，交给文案模板。

import type { KeyedValue, SeriesInput } from '@xihan-ui/viz'
import type { ChartSummary, ChartSummaryPoint } from './types'
import { buildSummaryModel } from '@xihan-ui/viz'

export interface ChartSummaryFormat {
  readonly formatKey: (key: unknown) => string
  readonly formatValue: (value: number, seriesId: string) => string
}

/** 系列数据 → 摘要模型：数字与日期已按 locale 写好，模板只管措辞。 */
export function buildChartSummary(series: readonly SeriesInput[], format: ChartSummaryFormat): ChartSummary {
  const model = buildSummaryModel(series)
  const point = (value: KeyedValue | null, seriesId: string): ChartSummaryPoint | null =>
    value ? { key: format.formatKey(value.key), value: format.formatValue(value.value, seriesId) } : null
  return {
    seriesCount: model.seriesCount,
    range: model.keys
      ? { first: format.formatKey(model.keys.first), last: format.formatKey(model.keys.last), count: model.keys.count }
      : null,
    series: model.series.map(s => ({
      id: s.id,
      name: s.name,
      count: s.count,
      min: point(s.min, s.id),
      max: point(s.max, s.id),
      first: point(s.first, s.id),
      last: point(s.last, s.id),
      change: s.change,
    })),
  }
}
