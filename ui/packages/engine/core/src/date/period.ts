/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 月、季度、年的边界，与 ISO 周的反查。日期时间保留时间部分，只挪日期。

import type { PlainDateTime } from './plain'
import type { DayOfWeek } from './types'
import { civilOf, epochDayOfIsoWeek, isoWeeksInYear, requireInteger } from './calendar'
import { PlainDate } from './plain'

type DateLike = PlainDate | PlainDateTime

/** 第几季度，1–4。 */
export function quarterOf(date: DateLike): number {
  return Math.ceil(date.month / 3)
}

export function startOfMonth<T extends DateLike>(date: T): T {
  return date.with({ day: 1 }) as T
}

export function endOfMonth<T extends DateLike>(date: T): T {
  return date.with({ day: date.daysInMonth }) as T
}

export function startOfQuarter<T extends DateLike>(date: T): T {
  return date.with({ month: quarterOf(date) * 3 - 2, day: 1 }) as T
}

export function endOfQuarter<T extends DateLike>(date: T): T {
  // 季末月的末日：先落到季末月的 1 日，再取那个月的天数
  const last = date.with({ month: quarterOf(date) * 3, day: 1 })
  return last.with({ day: last.daysInMonth }) as T
}

export function startOfYear<T extends DateLike>(date: T): T {
  return date.with({ month: 1, day: 1 }) as T
}

export function endOfYear<T extends DateLike>(date: T): T {
  return date.with({ month: 12, day: 31 }) as T
}

/**
 * ISO 周年 yearOfWeek 的第 week 周、星期 dayOfWeek（缺省星期一）是哪一天。
 * week 超出该年的周数（52 或 53）抛 RangeError。
 */
export function fromIsoWeek(yearOfWeek: number, week: number, dayOfWeek: DayOfWeek = 1): PlainDate {
  const year = requireInteger(yearOfWeek, 'yearOfWeek')
  const weeks = isoWeeksInYear(year)
  if (requireInteger(week, 'week') < 1 || week > weeks)
    throw new RangeError(`[xh] ${year} 年只有 ${weeks} 个 ISO 周，收到第 ${week} 周`)
  if (requireInteger(dayOfWeek, 'dayOfWeek') < 1 || dayOfWeek > 7)
    throw new RangeError(`[xh] dayOfWeek 须在 1–7 之间，收到 ${dayOfWeek}`)
  const [y, m, d] = civilOf(epochDayOfIsoWeek(year, week, dayOfWeek))
  return new PlainDate(y, m, d)
}
