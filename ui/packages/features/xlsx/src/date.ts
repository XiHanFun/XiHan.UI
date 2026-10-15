/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 墙上时间与 Excel 序列值的换算。

/** 不带时区的墙上时间；没写的时分秒按 0 计。 */
export interface XlsxDateTime {
  readonly year: number
  /** 1–12。 */
  readonly month: number
  /** 1–31。 */
  readonly day: number
  readonly hour?: number
  readonly minute?: number
  readonly second?: number
  readonly millisecond?: number
}

const DAY_MS = 86_400_000

function inRange(value: number | undefined, min: number, max: number): boolean {
  return value === undefined || (Number.isInteger(value) && value >= min && value <= max)
}

/** 是否带时刻：时、分、秒、毫秒任一写了。 */
export function hasTime(value: XlsxDateTime): boolean {
  return value.hour !== undefined || value.minute !== undefined || value.second !== undefined || value.millisecond !== undefined
}

/**
 * 墙上时间换成 Excel 序列值（1900 日期系统，1899-12-30 为 0，小数部分是一天里的时刻；
 * 1900-03-01 之前按 Excel 的计数减一）。不是合法日期或不在 1900-01-01 至 9999-12-31 之间时返回 null。
 */
export function excelSerial(value: XlsxDateTime): number | null {
  const { year, month, day } = value
  if (!inRange(year, 1900, 9999) || !inRange(month, 1, 12) || !inRange(day, 1, 31))
    return null
  if (!inRange(value.hour, 0, 23) || !inRange(value.minute, 0, 59) || !inRange(value.second, 0, 59) || !inRange(value.millisecond, 0, 999))
    return null
  const date = new Date(Date.UTC(2000, 0, 1))
  date.setUTCFullYear(year, month - 1, day)
  if (date.getUTCMonth() !== month - 1)
    return null
  const time = ((value.hour ?? 0) * 3600 + (value.minute ?? 0) * 60 + (value.second ?? 0)) * 1000 + (value.millisecond ?? 0)
  const serial = (date.getTime() + time) / DAY_MS + 25_569
  return serial < 61 ? serial - 1 : serial
}
