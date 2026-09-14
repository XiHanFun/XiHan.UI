/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker.projection 相关实现。

import type { DateRangePickerApi, DateRangePickerFieldApi } from './date-range-picker.types'
import { resolveDatePickerPanelIndex } from '../date-picker'

/** 面板下标的解析与日期选择器同一条规则：缺席、空串或非法值都回到真实父面板。 */
export function resolveDateRangePickerPanelIndex(input: number | string | undefined, fallback: number): number {
  return resolveDatePickerPanelIndex(input, fallback)
}

export type DateRangePickerFieldIndex = 0 | 1

/** 起止字段只允许两组；除精确的 1 外都归起点组。 */
export function resolveDateRangePickerFieldIndex(input: number | string | undefined): DateRangePickerFieldIndex {
  return Number(input) === 1 ? 1 : 0
}

/** 按统一起止身份取字段投影。 */
export function dateRangePickerFieldAt(api: DateRangePickerApi, index: DateRangePickerFieldIndex): DateRangePickerFieldApi {
  return index === 1 ? api.fieldEnd : api.field
}
