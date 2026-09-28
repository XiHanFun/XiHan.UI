/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 date range picker 模块的公共接口。

export { dateRangePickerAnatomy } from './date-range-picker.anatomy'
export { connectDateRangePicker } from './date-range-picker.connect'
export { dateRangePickerKeyboard } from './date-range-picker.keyboard'
export {
  compareDateRangeEnds,
  DATE_RANGE_PICKER_DEFAULT_PLACEMENT,
  dateRangePickerCalendarProps,
  dateRangePickerDefaultTime,
  dateRangePickerFieldEndProps,
  dateRangePickerFieldProps,
  dateRangePickerFocusedValue,
  dateRangePickerJoinTimes,
  dateRangePickerLocale,
  dateRangePickerMachine,
  dateRangePickerShowTime,
  dateRangePickerTimeGranularity,
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
  DateRangePickerActiveIndexChangeDetails,
  DateRangePickerApi,
  DateRangePickerColumnGroupProps,
  DateRangePickerEndIndex,
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
  DateRangePickerTimeColumnGroup,
  DateRangePickerTimeColumnProps,
  DateRangePickerTimeItemProps,
  DateRangePickerTimeItemTextProps,
  DateRangePickerTranslations,
  DateRangePickerValueChangeDetails,
  DateRangePickerValueSource,
} from './date-range-picker.types'
