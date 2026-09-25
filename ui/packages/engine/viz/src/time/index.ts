/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 time 模块的公共接口。

export { localCalendar, utcCalendar } from './calendar'
export type { TimeCalendar, WallTime } from './calendar'
export { createTimeIntervalSet, localIntervals, utcIntervals } from './interval'
export type { TimeInterval, TimeIntervalName, TimeIntervalSet } from './interval'
export { timeTickInterval, timeTicks } from './ticks'
export type { TimeTickInterval, TimeTickOptions } from './ticks'
