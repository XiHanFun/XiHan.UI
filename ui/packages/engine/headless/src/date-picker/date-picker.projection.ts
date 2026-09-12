import type { DatePickerApi, DatePickerFieldApi } from './date-picker.types'

export type DatePickerIndexInput = number | string | undefined
export type DatePickerFieldIndex = 0 | 1

/** 公开部件的面板下标：缺席、空串或非法值都回到调用方提供的真实父面板。 */
export function resolveDatePickerPanelIndex(input: DatePickerIndexInput, fallback: number): number {
  if (input === undefined || input === '')
    return fallback
  const parsed = Math.trunc(Number(input))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/** 起止字段只允许两组；除精确的 1 外都归起点组。 */
export function resolveDatePickerFieldIndex(input: DatePickerIndexInput): DatePickerFieldIndex {
  return Number(input) === 1 ? 1 : 0
}

/** 按统一起止身份取 DatePicker 的字段投影；非区间模式的终点如实返回 null。 */
export function datePickerFieldAt(api: DatePickerApi, index: DatePickerFieldIndex): DatePickerFieldApi | null {
  return index === 1 ? api.fieldEnd : api.field
}
