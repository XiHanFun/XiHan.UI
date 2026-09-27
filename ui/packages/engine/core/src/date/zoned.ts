/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 带 IANA 时区的毫秒精度时间点。值模型沿用 Temporal.ZonedDateTime 的核心语义。

import type { PlainDate, PlainTime } from './plain'
import type {
  PlainDateTimeLike,
  TimeToStringOptions,
  ZonedDateTimeFormatOptions,
  ZonedDateTimeFromOptions,
  ZonedDateTimeInstantLike,
  ZonedDateTimeLike,
} from './types'
import { PlainDateTime, wallMsOf } from './plain'
import { canonicalizeTimeZone, formatTimeZoneOffset, getTimeZoneOffset, instantOf, toEpochMs, wallOf } from './zone'

const OFFSET_PATTERN = /(Z|[+-]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)$/

function parseOffset(value: string): number {
  if (value === 'Z')
    return 0
  const match = /^([+-])(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value)
  if (!match)
    throw new RangeError(`[xh] 无效的 UTC 偏移量 ${JSON.stringify(value)}`)
  const hour = Number(match[2])
  const minute = Number(match[3])
  const second = Number(match[4] ?? 0)
  const millisecond = Number((match[5] ?? '').padEnd(3, '0'))
  if (hour > 23 || minute > 59 || second > 59)
    throw new RangeError(`[xh] 无效的 UTC 偏移量 ${JSON.stringify(value)}`)
  const total = ((hour * 60 + minute) * 60 + second) * 1000 + millisecond
  return match[1] === '-' ? -total : total
}

function fromWall(plainDateTime: PlainDateTime, timeZone: string, options?: ZonedDateTimeFromOptions): ZonedDateTime {
  const zone = canonicalizeTimeZone(timeZone)
  const epochMilliseconds = instantOf(wallMsOf(plainDateTime), zone, options?.disambiguation)
  return new ZonedDateTime(epochMilliseconds, zone)
}

function fromString(value: string, options?: ZonedDateTimeFromOptions): ZonedDateTime {
  if (!value.endsWith(']'))
    throw new RangeError(`[xh] ZonedDateTime 字符串必须带 [IANA/TimeZone]，收到 ${JSON.stringify(value)}`)
  const bracket = value.lastIndexOf('[')
  if (bracket <= 0)
    throw new RangeError(`[xh] ZonedDateTime 字符串必须带 [IANA/TimeZone]，收到 ${JSON.stringify(value)}`)
  const timeZone = value.slice(bracket + 1, -1)
  const zone = canonicalizeTimeZone(timeZone)
  let local = value.slice(0, bracket)
  const offsetMatch = OFFSET_PATTERN.exec(local)
  const offsetText = offsetMatch?.[1]
  if (offsetText)
    local = local.slice(0, -offsetText.length)
  const plainDateTime = PlainDateTime.from(local, options)
  if (!offsetText)
    return fromWall(plainDateTime, zone, options)

  const offset = parseOffset(offsetText)
  const epochMilliseconds = wallMsOf(plainDateTime) - offset
  toEpochMs(epochMilliseconds)
  if (wallOf(epochMilliseconds, zone) !== wallMsOf(plainDateTime) || getTimeZoneOffset(epochMilliseconds, zone) !== offset) {
    throw new RangeError(
      `[xh] ${offsetText} 不是 ${plainDateTime.toString()} 在时区 ${zone} 的有效偏移量`,
    )
  }
  return new ZonedDateTime(epochMilliseconds, zone)
}

export class ZonedDateTime {
  readonly epochMilliseconds: number
  readonly timeZoneId: string
  readonly #plainDateTime: PlainDateTime

  constructor(epochMilliseconds: number, timeZone: string) {
    if (!Number.isInteger(epochMilliseconds))
      throw new RangeError(`[xh] ZonedDateTime 只接受整数毫秒，收到 ${epochMilliseconds}`)
    this.epochMilliseconds = toEpochMs(epochMilliseconds)
    this.timeZoneId = canonicalizeTimeZone(timeZone)
    this.#plainDateTime = PlainDateTime.fromDate(this.epochMilliseconds, this.timeZoneId)
    Object.freeze(this)
  }

  static from(
    item: string | ZonedDateTime | ZonedDateTimeLike | ZonedDateTimeInstantLike,
    options?: ZonedDateTimeFromOptions,
  ): ZonedDateTime {
    if (item instanceof ZonedDateTime)
      return item
    if (typeof item === 'string')
      return fromString(item, options)
    if (item === null || typeof item !== 'object')
      throw new TypeError(`[xh] ZonedDateTime.from 需要字符串或字段对象，收到 ${String(item)}`)
    if ('epochMilliseconds' in item)
      return new ZonedDateTime(item.epochMilliseconds, item.timeZone)
    const plainDateTime = PlainDateTime.from(item, options)
    return fromWall(plainDateTime, item.timeZone, options)
  }

  static fromDate(instant: Date | number, timeZone: string): ZonedDateTime {
    return new ZonedDateTime(toEpochMs(instant), timeZone)
  }

  static fromPlainDateTime(
    plainDateTime: PlainDateTimeLike,
    timeZone: string,
    options?: ZonedDateTimeFromOptions,
  ): ZonedDateTime {
    return fromWall(PlainDateTime.from(plainDateTime, options), timeZone, options)
  }

  static compare(a: ZonedDateTime, b: ZonedDateTime): -1 | 0 | 1 {
    return a.epochMilliseconds < b.epochMilliseconds ? -1 : a.epochMilliseconds > b.epochMilliseconds ? 1 : 0
  }

  get year(): number { return this.#plainDateTime.year }
  get month(): number { return this.#plainDateTime.month }
  get day(): number { return this.#plainDateTime.day }
  get hour(): number { return this.#plainDateTime.hour }
  get minute(): number { return this.#plainDateTime.minute }
  get second(): number { return this.#plainDateTime.second }
  get millisecond(): number { return this.#plainDateTime.millisecond }
  get dayOfWeek(): number { return this.#plainDateTime.dayOfWeek }
  get dayOfYear(): number { return this.#plainDateTime.dayOfYear }
  get weekOfYear(): number { return this.#plainDateTime.weekOfYear }
  get yearOfWeek(): number { return this.#plainDateTime.yearOfWeek }
  get daysInMonth(): number { return this.#plainDateTime.daysInMonth }
  get daysInYear(): number { return this.#plainDateTime.daysInYear }
  get inLeapYear(): boolean { return this.#plainDateTime.inLeapYear }
  get offsetMilliseconds(): number { return getTimeZoneOffset(this.epochMilliseconds, this.timeZoneId) }
  get offset(): string { return formatTimeZoneOffset(this.offsetMilliseconds) }

  with(fields: Partial<PlainDateTimeLike>, options?: ZonedDateTimeFromOptions): ZonedDateTime {
    return fromWall(this.#plainDateTime.with(fields, options), this.timeZoneId, options)
  }

  /** 换时区但保留同一时间点。 */
  withTimeZone(timeZone: string): ZonedDateTime {
    return new ZonedDateTime(this.epochMilliseconds, timeZone)
  }

  /** 替换墙上日期时间，按当前时区重新求时间点。 */
  withPlainDateTime(plainDateTime: PlainDateTimeLike, options?: ZonedDateTimeFromOptions): ZonedDateTime {
    return ZonedDateTime.fromPlainDateTime(plainDateTime, this.timeZoneId, options)
  }

  equals(other: ZonedDateTime): boolean {
    return this.epochMilliseconds === other.epochMilliseconds && this.timeZoneId === other.timeZoneId
  }

  toPlainDateTime(): PlainDateTime { return this.#plainDateTime }
  toPlainDate(): PlainDate { return this.#plainDateTime.toPlainDate() }
  toPlainTime(): PlainTime { return this.#plainDateTime.toPlainTime() }
  toDate(): Date { return new Date(this.epochMilliseconds) }

  toString(options?: TimeToStringOptions): string {
    return `${this.#plainDateTime.toString(options)}${this.offset}[${this.timeZoneId}]`
  }

  toJSON(): string { return this.toString() }

  toLocaleString(locales?: string | readonly string[], options?: ZonedDateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locales as string | string[] | undefined, {
      ...options,
      timeZone: this.timeZoneId,
    }).format(this.epochMilliseconds)
  }

  valueOf(): never {
    throw new TypeError('[xh] ZonedDateTime 不能隐式转成数字；请显式读取 epochMilliseconds')
  }
}
