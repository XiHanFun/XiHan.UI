/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 date range picker 模块的公共接口。

export { dateRangePickerAnatomy } from './date-range-picker.anatomy'
export { connectDateRangePicker } from './date-range-picker.connect'
export { dateRangePickerKeyboard } from './date-range-picker.keyboard'
export {
  DATE_RANGE_PICKER_DEFAULT_PLACEMENT,
  dateRangePickerCalendarProps,
  dateRangePickerFieldEndProps,
  dateRangePickerFieldProps,
  dateRangePickerFocusedValue,
  dateRangePickerLocale,
  dateRangePickerMachine,
  findDateRangePickerCellEl,
} from './date-range-picker.machine'
export { dateRangePickerMeta } from './date-range-picker.meta'
export {
  dateRangePickerPresetMonth,
  dateRangePickerPresetRange,
  dateRangePickerPresetYear,
} from './date-range-picker.presets'
export { dateRangePickerFieldAt, resolveDateRangePickerFieldIndex, resolveDateRangePickerPanelIndex } from './date-range-picker.projection'
export type { DateRangePickerFieldIndex } from './date-range-picker.projection'
export type {
  DateRangePickerApi,
  DateRangePickerFieldApi,
  DateRangePickerFocusChangeDetails,
  DateRangePickerOpenChangeDetails,
  DateRangePickerPreset,
  DateRangePickerPresetProps,
  DateRangePickerPresetState,
  DateRangePickerPressedKey,
  DateRangePickerRefs,
  DateRangePickerSchema,
  DateRangePickerSegmentGroupProps,
  DateRangePickerServices,
  DateRangePickerTranslations,
  DateRangePickerValueChangeDetails,
  DateRangePickerValueSource,
} from './date-range-picker.types'
