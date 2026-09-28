/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按任意 IANA 时区排时间刻度：viz 的时间间隔只经由日历读写墙上时间，这里把日期模块的时区换算接成一份日历。

import type { TimeCalendar, TimeIntervalSet, WallTime } from '@xihan-ui/viz'
import { isValidTimeZone, PlainDateTime, ZonedDateTime } from '@xihan-ui/core/date'
import { createTimeIntervalSet } from '@xihan-ui/viz'

/** 某个时区的日历：时间点与该时区墙上时间互换。夏令时跳过的墙上时间取其后，重复的取较早那一次。 */
export function zonedTimeCalendar(timeZone: string): TimeCalendar {
  return Object.freeze({
    toWall(time: number): WallTime {
      const zoned = ZonedDateTime.fromDate(time, timeZone)
      return {
        year: zoned.year,
        month: zoned.month - 1,
        day: zoned.day,
        // 日期模块的星期是 1（周一）到 7（周日），viz 的是 0（周日）到 6
        weekday: zoned.dayOfWeek % 7,
        hour: zoned.hour,
        minute: zoned.minute,
        second: zoned.second,
        millisecond: zoned.millisecond,
      }
    },
    fromWall(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): number {
      // 字段越界先按公历进位（第 13 月是下一年 1 月），再落到这个时区
      const carried = new Date(0)
      carried.setUTCFullYear(year, month, day)
      carried.setUTCHours(hour, minute, second, millisecond)
      const wall = new PlainDateTime(
        carried.getUTCFullYear(),
        carried.getUTCMonth() + 1,
        carried.getUTCDate(),
        carried.getUTCHours(),
        carried.getUTCMinutes(),
        carried.getUTCSeconds(),
        carried.getUTCMilliseconds(),
      )
      return ZonedDateTime.fromPlainDateTime(wall, timeZone).epochMilliseconds
    },
  })
}

const cache = new Map<string, TimeIntervalSet>()

/** 某个时区的一整套时间间隔，按时区名缓存。时区名无效时返回 null，由调用方报出。 */
export function zonedTimeIntervals(timeZone: string): TimeIntervalSet | null {
  if (!isValidTimeZone(timeZone))
    return null
  let intervals = cache.get(timeZone)
  if (!intervals) {
    intervals = createTimeIntervalSet(zonedTimeCalendar(timeZone))
    cache.set(timeZone, intervals)
  }
  return intervals
}
