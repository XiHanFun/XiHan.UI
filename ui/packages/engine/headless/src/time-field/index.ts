/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 time field 模块的公共接口。

export { dayPeriodLabel } from '../shared/day-period'
export { timeFieldAnatomy } from './time-field.anatomy'
export { connectTimeField } from './time-field.connect'
export { timeFieldKeyboard } from './time-field.keyboard'
export {
  appendSegmentDigit,
  clearTimeSegment,
  cycleTimeSegment,
  draftFromTime,
  emptyTimeDraft,
  formatTimeValue,
  isTimeOutOfRange,
  parseTimeValue,
  resolveHourCycle,
  resolveTimeDraft,
  sameTimeDraft,
  segmentNumber,
  segmentRange,
  setTimeDayPeriod,
  setTimeSegment,
  TIME_FIELD_GRANULARITY,
  TIME_FIELD_HOUR_CYCLE,
  TIME_FIELD_PLACEHOLDER,
  timeFieldMachine,
  timeSegments,
  timeSegmentText,
  to12Hour,
  to24Hour,
} from './time-field.machine'
export { timeFieldMeta } from './time-field.meta'
export type { TimeDayPeriod, TimeDraft, TimeFieldApi, TimeFieldSchema, TimeFieldSegmentProps, TimeFieldTranslations, TimeFieldValueChangeDetails, TimeGranularity, TimeHourCycle, TimeSegmentType } from './time-field.types'
