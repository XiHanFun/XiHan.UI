/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表共有的缺省文案：取自英文语言包，按语言由作者或全局语言包覆盖。

import type { ChartDatumDetails, ChartSummary, ChartTranslations } from './types'
import { CARTESIAN_CHART_EN_US, CHART_EN_US } from '../../locale/en-US'

/** 数据标记的缺省可及名：「键, 系列 值」，与提示框里一行的信息相同；取自英文语言包。 */
export function defaultChartDatumLabel(details: ChartDatumDetails): string {
  return CHART_EN_US.datumLabel(details)
}

export const CHART_TRANSLATIONS: ChartTranslations = Object.freeze({ ...CHART_EN_US })

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
 * 缺省摘要：系列数与自变量范围一句，每个系列的最低与最高各一句；取自英文语言包。
 * 最值相同的系列（只有一个值或全部相等）只报一次。
 */
export function defaultChartSummary(model: ChartSummary): string {
  return CARTESIAN_CHART_EN_US.summary(model)
}
