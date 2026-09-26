/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/date —— 不带时区的日期值、公历运算、按时区读写时刻、按地区划分的周与格式化。
// 命名与规则沿用 Temporal；运行环境普遍提供 Temporal 之后可以逐个换成原生对象。

export { daysInMonth, daysInYear, isLeapYear, isoWeeksInYear } from './calendar'
export { createDateFormatter } from './format'
export type { PlainDateFormatter } from './format'
export type { PlainDateFormatOptions } from './intl'
export { now, today } from './now'
export { endOfMonth, endOfQuarter, endOfYear, fromIsoWeek, quarterOf, startOfMonth, startOfQuarter, startOfYear } from './period'
export { PlainDate, PlainDateTime, PlainTime } from './plain'
export type {
  DateDifferenceOptions,
  DateDuration,
  DateDurationLike,
  DateTimeDifferenceOptions,
  DateTimeDuration,
  DateTimeDurationLike,
  DateTimeRoundOptions,
  DateUnit,
  DayOfWeek,
  Disambiguation,
  DisambiguationOptions,
  Overflow,
  OverflowOptions,
  PlainDateLike,
  PlainDateTimeLike,
  PlainTimeLike,
  RoundingMode,
  TimeDifferenceOptions,
  TimeDuration,
  TimeDurationLike,
  TimeRoundOptions,
  TimeToStringOptions,
  TimeUnit,
} from './types'
export { dayOfWeekIn, endOfWeek, getWeekInfo, isWeekend, startOfWeek, weeksInMonth } from './week'
export type { WeekInfo, WeekStart } from './week'
export { getLocalTimeZone, getTimeZoneOffset, isValidTimeZone } from './zone'
