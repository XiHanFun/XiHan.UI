/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 calendar 模块的公共接口。

export { calendarAnatomy, calendarCellTriggerQuery } from './calendar.anatomy'
export { connectCalendar } from './calendar.connect'
export {
  buildMonthGrid,
  buildPeriodGrid,
  buildWeekDays,
  CALENDAR_FIXED_WEEKS,
  CALENDAR_LOCALE,
  CALENDAR_PERIOD_COLUMNS,
  CALENDAR_WEEK_LENGTH,
  CALENDAR_YEARS_PER_PAGE,
  calendarDrillAnchor,
  calendarHeadingPieces,
  calendarNavFromKey,
  calendarNavTarget,
  calendarPageMonths,
  calendarPeriodIndex,
  calendarPeriodMonths,
  calendarPeriodOf,
  calendarPeriodStart,
  calendarPeriodValue,
  calendarWeekRange,
  calendarZoomIn,
  isoWeekNumber,
  isoWeekYear,
  parseCalendarDate,
} from './calendar.grid'
export type {
  CalendarDay,
  CalendarGranularity,
  CalendarHeadingPieces,
  CalendarMonthGrid,
  CalendarMonthGridOptions,
  CalendarNavIntent,
  CalendarNavKeyEventLike,
  CalendarPeriod,
  CalendarPeriodGrid,
  CalendarPeriodGridOptions,
  CalendarPeriodValue,
  CalendarView,
  CalendarWeekDay,
  CalendarWeekDaysOptions,
} from './calendar.grid'
export { calendarKeyboard } from './calendar.keyboard'
export { calendarMachine } from './calendar.machine'
export { calendarMeta } from './calendar.meta'
export type { CalendarApi, CalendarCellProps, CalendarFocusChangeDetails, CalendarFocusModel, CalendarPanel, CalendarPanelProps, CalendarRefs, CalendarSchema, CalendarSelectionMode, CalendarTranslations, CalendarValueChangeDetails, CalendarViewChangeDetails, CalendarWeekdayFormat, CalendarWeekDayProps, CalendarWeekNumberProps } from './calendar.types'
