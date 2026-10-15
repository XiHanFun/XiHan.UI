/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 混合输入的墙上时间：ISO 字符串（可只写到年或月）、毫秒数与 Date 统一读成某个时区里的各部分，再取可排序的字符串与分桶键。

import { PlainDate, PlainDateTime } from './plain'
import { getLocalTimeZone } from './zone'
import { ZonedDateTime } from './zoned'

/** 墙上时间的各部分；字符串里没写到的部分为 null。 */
export interface WallClockParts {
  readonly year: number
  readonly month: number | null
  readonly day: number | null
  readonly hour: number | null
  readonly minute: number | null
  readonly second: number | null
  readonly millisecond: number | null
}

/** 把时刻换成墙上时间所用的时区。 */
export interface WallClockOptions {
  /** IANA 时区名；缺省为运行环境所在的时区。 */
  readonly timeZone?: string
}

/** 分桶粒度。 */
export type DateBucketUnit = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour'

/** 全部分桶粒度，由粗到细。 */
export const DATE_BUCKET_UNITS: readonly DateBucketUnit[] = Object.freeze(['year', 'quarter', 'month', 'week', 'day', 'hour'])

const ISO_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}(?::?\d{2})?)?)?)?)?$/

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

function isMissing(value: unknown): boolean {
  return value === null
    || value === undefined
    || (typeof value === 'number' && Number.isNaN(value))
    || (value instanceof Date && Number.isNaN(value.getTime()))
}

function offsetMilliseconds(zone: string): number {
  if (zone === 'Z')
    return 0
  const digits = zone.slice(1).replace(':', '')
  const minutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2) || '0')
  return (zone.startsWith('-') ? -minutes : minutes) * 60_000
}

function partsOfInstant(time: number, timeZone: string): WallClockParts {
  const wall = PlainDateTime.fromDate(time, timeZone)
  return { year: wall.year, month: wall.month, day: wall.day, hour: wall.hour, minute: wall.minute, second: wall.second, millisecond: wall.millisecond }
}

function invalidText(value: string): RangeError {
  return new RangeError(`[xh] 不是合法的日期值：${JSON.stringify(value)}`)
}

function partsOfText(value: string, timeZone: () => string): WallClockParts {
  const match = ISO_PATTERN.exec(value)
  if (!match)
    throw invalidText(value)
  const [, y, mo, d, h, mi, s, ms, zone] = match
  const year = Number(y)
  const month = mo === undefined ? null : Number(mo)
  if (month !== null && (month < 1 || month > 12))
    throw invalidText(value)
  if (d === undefined)
    return { year, month, day: null, hour: null, minute: null, second: null, millisecond: null }
  const wall = PlainDateTime.from(zone === undefined ? value : value.slice(0, value.length - zone.length))
  if (zone !== undefined)
    return partsOfInstant(ZonedDateTime.fromPlainDateTime(wall, 'UTC').epochMilliseconds - offsetMilliseconds(zone), timeZone())
  return {
    year,
    month,
    day: wall.day,
    hour: h === undefined ? null : wall.hour,
    minute: mi === undefined ? null : wall.minute,
    second: s === undefined ? null : wall.second,
    millisecond: ms === undefined ? null : wall.millisecond,
  }
}

/**
 * 日期值在某个时区里的墙上时间各部分；缺失值（null、undefined、NaN、无效 Date）为 null。
 *
 * - 字符串按 ISO 8601 读，可以只写到年（`2026`）或月（`2026-10`），日期与时间之间可用 `T` 或空格；
 *   不带偏移的字符串按写下的墙上时间取，与时区无关，没写到的部分为 null；
 *   带 `Z` 或偏移（`+08`、`+0800`、`+08:00`）的字符串是时刻，换算到 timeZone 的墙上时间。
 * - 毫秒数与 Date 是时刻，换算到 timeZone 的墙上时间。
 *
 * 字符串不合法、毫秒数不是有限数、时区不认识时抛 `RangeError`；其它类型的值抛 `TypeError`。
 */
export function wallClockParts(value: unknown, options: WallClockOptions = {}): WallClockParts | null {
  if (isMissing(value))
    return null
  const timeZone = (): string => options.timeZone ?? getLocalTimeZone()
  if (typeof value === 'string')
    return partsOfText(value, timeZone)
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new RangeError(`[xh] 毫秒数必须是有限数，收到 ${value}`)
    return partsOfInstant(value, timeZone())
  }
  if (value instanceof Date)
    return partsOfInstant(value.getTime(), timeZone())
  throw new TypeError(`[xh] 日期值只能是字符串、毫秒数或 Date，收到 ${typeof value}`)
}

/**
 * 日期值写成可按字符串比较的墙上时间：date 写到日（`YYYY-MM-DD`），datetime 写到毫秒（`YYYY-MM-DDTHH:mm:ss.sss`）；
 * 没写到的部分取最小值。缺失值为 null；值的读法与报错同 `wallClockParts`。
 */
export function wallClock(value: unknown, precision: 'date' | 'datetime', options: WallClockOptions = {}): string | null {
  const parts = wallClockParts(value, options)
  if (parts === null)
    return null
  const date = `${pad(parts.year, 4)}-${pad(parts.month ?? 1, 2)}-${pad(parts.day ?? 1, 2)}`
  if (precision === 'date')
    return date
  return `${date}T${pad(parts.hour ?? 0, 2)}:${pad(parts.minute ?? 0, 2)}:${pad(parts.second ?? 0, 2)}.${pad(parts.millisecond ?? 0, 3)}`
}

/**
 * 日期值按粒度取分桶键，键按字符串排序即按时间排序：
 * year → `2026`，quarter → `2026-Q4`，month → `2026-10`，week → `2026-W42`（ISO 周，年份取 ISO 周年），
 * day → `2026-10-16`，hour → `2026-10-16T08`。
 *
 * 缺失值为 null；值的读法与报错同 `wallClockParts`。字符串没写到粒度所需的部分（例如只写到月却按日分桶）时抛 `RangeError`。
 */
export function bucketKey(value: unknown, unit: DateBucketUnit, options: WallClockOptions = {}): string | null {
  if (!DATE_BUCKET_UNITS.includes(unit))
    throw new RangeError(`[xh] 分桶粒度只能是 ${DATE_BUCKET_UNITS.join(' / ')}，收到 ${String(unit)}`)
  const parts = wallClockParts(value, options)
  if (parts === null)
    return null
  const short = (): RangeError => new RangeError(`[xh] 日期值 ${JSON.stringify(value)} 没写到按 ${unit} 分桶所需的部分`)
  const year = pad(parts.year, 4)
  if (unit === 'year')
    return year
  if (parts.month === null)
    throw short()
  if (unit === 'quarter')
    return `${year}-Q${Math.ceil(parts.month / 3)}`
  const month = `${year}-${pad(parts.month, 2)}`
  if (unit === 'month')
    return month
  if (parts.day === null)
    throw short()
  if (unit === 'week') {
    const date = new PlainDate(parts.year, parts.month, parts.day)
    return `${pad(date.yearOfWeek, 4)}-W${pad(date.weekOfYear, 2)}`
  }
  const day = `${month}-${pad(parts.day, 2)}`
  if (unit === 'day')
    return day
  if (parts.hour === null)
    throw short()
  return `${day}T${pad(parts.hour, 2)}`
}
