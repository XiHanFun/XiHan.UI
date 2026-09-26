/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 shared/calendar 模块的公共接口：网格纯数学与两个日历组件共用的契约。

export { createCalendarFrame } from './connect-base'
export type { CalendarCellBaseState, CalendarCellClickOptions, CalendarFrame, CalendarGridKeyOptions, CalendarPart } from './connect-base'
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
  calendarNavFromKey,
  calendarNavTarget,
  calendarPageMonths,
  calendarPeriodIndex,
  calendarPeriodMonths,
  calendarPeriodOf,
  calendarPeriodValue,
  calendarWeekRange,
  calendarZoomIn,
  parseCalendarDate,
  visibleCountOf,
} from './grid'
export type {
  CalendarDay,
  CalendarGranularity,
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
} from './grid'
export {
  alignVisibleStart,
  calendarBaseActions,
  calendarBaseContext,
  calendarBaseRefs,
  compareIso,
  initialVisibleStart,
  sortIso,
  syncGranularityBase,
  trackLiveness,
} from './machine-base'
export type { CalendarBaseSchema } from './machine-base'
export type {
  CalendarBaseAction,
  CalendarBaseApi,
  CalendarBaseContext,
  CalendarBaseEffect,
  CalendarBaseEvent,
  CalendarBaseProps,
  CalendarBaseRefs,
  CalendarCellProps,
  CalendarFocusChangeDetails,
  CalendarFocusModel,
  CalendarPanel,
  CalendarPanelProps,
  CalendarViewChangeDetails,
  CalendarWeekdayFormat,
  CalendarWeekDayProps,
  CalendarWeekNumberProps,
} from './types'
