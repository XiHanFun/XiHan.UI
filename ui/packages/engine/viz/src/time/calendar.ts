/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 墙上时间与时间点的互换：本地与 UTC 两份实现；其他时区由调用方按同一接口提供。

/** 某个时区里看到的墙上时间。month 从 0 起，weekday 0 = 星期日。 */
export interface WallTime {
  readonly year: number
  readonly month: number
  readonly day: number
  readonly weekday: number
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly millisecond: number
}

/**
 * 日历：时间点（epoch 毫秒）与墙上时间互换。时间间隔只经由它读写日期字段，
 * 本地、UTC 与任意时区因此共用同一套间隔算法。
 */
export interface TimeCalendar {
  toWall: (time: number) => WallTime
  /**
   * 墙上时间 → 时间点。字段越界时进位（第 13 月是下一年 1 月，第 0 日是上月最后一天）。
   * 夏令时跳过的墙上时间取其后的时刻，重复的墙上时间取较早的那一次。
   */
  fromWall: (year: number, month: number, day: number, hour?: number, minute?: number, second?: number, millisecond?: number) => number
}

/** 运行环境所在时区的日历。年份 0–99 按字面年份处理，不映射到 1900 年代。 */
export const localCalendar: TimeCalendar = Object.freeze({
  toWall(time: number): WallTime {
    const date = new Date(time)
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      weekday: date.getDay(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    }
  },
  fromWall(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): number {
    const date = new Date(0)
    date.setFullYear(year, month, day)
    date.setHours(hour, minute, second, millisecond)
    return date.getTime()
  },
})

/** UTC 日历。年份 0–99 按字面年份处理。 */
export const utcCalendar: TimeCalendar = Object.freeze({
  toWall(time: number): WallTime {
    const date = new Date(time)
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
      weekday: date.getUTCDay(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
      millisecond: date.getUTCMilliseconds(),
    }
  },
  fromWall(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): number {
    const date = new Date(0)
    date.setUTCFullYear(year, month, day)
    date.setUTCHours(hour, minute, second, millisecond)
    return date.getTime()
  },
})

/** 公历日序号：与时区无关，只由年月日决定，两日之差就是相隔的日历日数。 */
export function dayNumber(year: number, month: number, day: number): number {
  const date = new Date(0)
  date.setUTCFullYear(year, month, day)
  return Math.round(date.getTime() / 86_400_000)
}
