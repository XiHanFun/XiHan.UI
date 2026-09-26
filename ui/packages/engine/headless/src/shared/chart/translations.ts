/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表共有的内建文案：一律英文，与其余组件口径一致，按语言由作者覆盖。

import type { ChartDatumDetails, ChartSummary, ChartTranslations } from './types'

/** 数据标记的缺省可及名：「键, 系列 值」，与提示框里一行的信息相同。 */
export function defaultChartDatumLabel(details: ChartDatumDetails): string {
  const key = details.formatted.key ?? String(details.key)
  const value = details.formatted.value ?? ''
  return `${key}, ${details.seriesName} ${value}`
}

export const CHART_TRANSLATIONS: ChartTranslations = Object.freeze({
  chartRoleDescription: 'chart',
  seriesRoleDescription: 'series',
  legendLabel: 'Legend',
  missingValue: 'No value',
  emptyText: 'No data',
  otherLabel: 'Other',
  tableCaption: 'Data table',
  datumLabel: defaultChartDatumLabel,
})

/** 合并作者给的部分文案；未给的条目取缺省。 */
export function resolveChartTranslations<T extends ChartTranslations>(defaults: T, overrides: Partial<T> | undefined): T {
  if (!overrides)
    return defaults
  const out = { ...defaults }
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined)
      (out as Record<string, unknown>)[key] = value
  }
  return out
}

/**
 * 缺省摘要：系列数与自变量范围一句，每个系列的最低与最高各一句。
 * 最值相同的系列（只有一个值或全部相等）只报一次。
 */
export function defaultChartSummary(model: ChartSummary): string {
  if (!model.range || model.series.every(s => s.count === 0))
    return 'No data.'
  const { first, last, count } = model.range
  // series 单复数同形
  const head = `${model.seriesCount} series, ${count} ${count === 1 ? 'point' : 'points'} from ${first} to ${last}.`
  const lines = model.series
    .filter(s => s.min && s.max)
    .map((s) => {
      const min = s.min as NonNullable<typeof s.min>
      const max = s.max as NonNullable<typeof s.max>
      if (min.key === max.key && min.value === max.value)
        return `${s.name}: ${max.value} at ${max.key}.`
      return `${s.name}: lowest ${min.value} at ${min.key}, highest ${max.value} at ${max.key}.`
    })
  return [head, ...lines].join(' ')
}
