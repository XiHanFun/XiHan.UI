/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 公历（ISO 8601 推及历）的纯整数运算：日序号、闰年、月长、ISO 周。
// 不借 Date：Date.UTC 会把 0–99 年映射到 1900 年代，而且拿不到 Date 范围之外的日子。

/** 一天的毫秒数。 */
export const MS_PER_DAY = 86_400_000
export const MS_PER_HOUR = 3_600_000
export const MS_PER_MINUTE = 60_000
export const MS_PER_SECOND = 1000

/**
 * 日序号的上下界：1970-01-01 为 0。与 Temporal.PlainDate 的范围一致，
 * 即 -271821-04-19 到 +275760-09-13。
 */
export const MIN_EPOCH_DAY = -100_000_001
export const MAX_EPOCH_DAY = 100_000_000

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** month 取 1–12。 */
export function daysInMonth(year: number, month: number): number {
  return month === 2 && isLeapYear(year) ? 29 : MONTH_DAYS[month - 1]!
}

/**
 * 年月日 → 日序号。月、日必须已在合法范围内。
 * 按三月起算的历年换算（二月落在年末，闰日不打断月序），每 400 年一个周期。
 */
export function epochDayOf(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year
  const era = Math.floor(y / 400)
  const yoe = y - era * 400
  const mp = (month + 9) % 12
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
  return era * 146_097 + doe - 719_468
}

/** 日序号 → [年, 月, 日]。 */
export function civilOf(epochDay: number): [number, number, number] {
  const z = epochDay + 719_468
  const era = Math.floor(z / 146_097)
  const doe = z - era * 146_097
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365)
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
  const mp = Math.floor((5 * doy + 2) / 153)
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1
  const month = mp < 10 ? mp + 3 : mp - 9
  return [era * 400 + yoe + (month <= 2 ? 1 : 0), month, day]
}

/** 星期几：1 = 星期一 … 7 = 星期日。1970-01-01 是星期四。 */
export function isoDayOfWeek(epochDay: number): number {
  return ((((epochDay + 3) % 7) + 7) % 7) + 1
}

/** 一年中的第几天，1 起。 */
export function dayOfYearOf(year: number, month: number, day: number): number {
  return epochDayOf(year, month, day) - epochDayOf(year, 1, 1) + 1
}

/**
 * ISO 周：周一起算，含当年第一个星期四的那一周是第 1 周。
 * 跨年的那一周归星期四所在的年，所以 12 月底可能是下一年的第 1 周、1 月初可能是上一年的第 52/53 周。
 */
export function isoWeekOf(year: number, month: number, day: number): { week: number, year: number } {
  const epochDay = epochDayOf(year, month, day)
  const thursday = epochDay + 4 - isoDayOfWeek(epochDay)
  const [weekYear] = civilOf(thursday)
  return { week: Math.floor((thursday - epochDayOf(weekYear, 1, 1)) / 7) + 1, year: weekYear }
}

/** 这一 ISO 周年有几周：1 月 1 日是星期四，或闰年里 1 月 1 日是星期三，就有 53 周。 */
export function isoWeeksInYear(year: number): number {
  const jan1 = isoDayOfWeek(epochDayOf(year, 1, 1))
  return jan1 === 4 || (jan1 === 3 && isLeapYear(year)) ? 53 : 52
}

/** ISO 周年的第 week 周、星期 dayOfWeek（1–7）是哪一天的日序号。 */
export function epochDayOfIsoWeek(year: number, week: number, dayOfWeek: number): number {
  const jan4 = epochDayOf(year, 1, 4)
  return jan4 - (isoDayOfWeek(jan4) - 1) + (week - 1) * 7 + (dayOfWeek - 1)
}

/** 年月按进位归一：第 13 月是下一年 1 月，第 0 月是上一年 12 月。 */
export function balanceYearMonth(year: number, month: number): [number, number] {
  const index = year * 12 + (month - 1)
  const balancedYear = Math.floor(index / 12)
  return [balancedYear, index - balancedYear * 12 + 1]
}

/** 按字段逐位比较三元组：返回 -1 / 0 / 1。 */
export function compareFields(a: readonly number[], b: readonly number[]): -1 | 0 | 1 {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i]! !== b[i]!)
      return a[i]! < b[i]! ? -1 : 1
  }
  return 0
}

/** 整数校验：不收小数、NaN 与无穷。 */
export function requireInteger(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value))
    throw new RangeError(`[xh] ${name} 必须是整数，收到 ${String(value)}`)
  return value
}

/** 可缺省的整数字段：undefined 视为 0。 */
export function optionalInteger(value: unknown, name: string): number {
  return value === undefined ? 0 : requireInteger(value, name)
}
