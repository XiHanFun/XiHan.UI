/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 不带时区的日期、时间与日期时间：不可变值对象，公历（ISO 8601 推及历），精度到毫秒。
// 方法名、取值范围与越界规则沿用 Temporal.PlainDate / PlainTime / PlainDateTime。

import type { PlainDateFormatOptions } from './intl'
import type {
  DateDifferenceOptions,
  DateDuration,
  DateDurationLike,
  DateTimeDifferenceOptions,
  DateTimeDuration,
  DateTimeDurationLike,
  DateTimeRoundOptions,
  DateUnit,
  DisambiguationOptions,
  Overflow,
  OverflowOptions,
  PlainDateLike,
  PlainDateTimeLike,
  PlainTimeLike,
  RoundingMode,
  TimeDifferenceOptions,
  TimeDuration,
  TimeDurationLike,
  TimeRoundOptions,
  TimeToStringOptions,
  TimeUnit,
} from './types'
import {
  balanceYearMonth,
  civilOf,
  compareFields,
  dayOfYearOf,
  daysInMonth,
  daysInYear,
  epochDayOf,
  isLeapYear,
  isoDayOfWeek,
  isoWeekOf,
  MAX_EPOCH_DAY,
  MIN_EPOCH_DAY,
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  optionalInteger,
  requireInteger,
} from './calendar'
import { plainIntlFormat } from './intl'
import { getLocalTimeZone, instantOf, toEpochMs, wallOf } from './zone'

// —— 字段校验与越界处理 ——

function checkEpochDay(epochDay: number): void {
  if (!(epochDay >= MIN_EPOCH_DAY && epochDay <= MAX_EPOCH_DAY))
    throw new RangeError('[xh] 日期超出可表示的范围（-271821-04-19 至 +275760-09-13）')
}

function regulate(value: number, min: number, max: number, name: string, overflow: Overflow): number {
  if (value >= min && value <= max)
    return value
  if (overflow === 'reject')
    throw new RangeError(`[xh] ${name} 须在 ${min}–${max} 之间，收到 ${value}`)
  return Math.min(Math.max(value, min), max)
}

function overflowOf(options: OverflowOptions | undefined): Overflow {
  const overflow = options?.overflow ?? 'constrain'
  if (overflow !== 'constrain' && overflow !== 'reject')
    throw new RangeError(`[xh] overflow 只能是 constrain 或 reject，收到 ${String(overflow)}`)
  return overflow
}

function regulateDate(fields: PlainDateLike, overflow: Overflow): [number, number, number] {
  const year = requireInteger(fields.year, 'year')
  const month = regulate(requireInteger(fields.month, 'month'), 1, 12, 'month', overflow)
  const day = regulate(requireInteger(fields.day, 'day'), 1, daysInMonth(year, month), 'day', overflow)
  return [year, month, day]
}

function regulateTime(fields: PlainTimeLike, overflow: Overflow): [number, number, number, number] {
  return [
    regulate(optionalInteger(fields.hour, 'hour'), 0, 23, 'hour', overflow),
    regulate(optionalInteger(fields.minute, 'minute'), 0, 59, 'minute', overflow),
    regulate(optionalInteger(fields.second, 'second'), 0, 59, 'second', overflow),
    regulate(optionalInteger(fields.millisecond, 'millisecond'), 0, 999, 'millisecond', overflow),
  ]
}

function msOfDayOf(hour: number, minute: number, second: number, millisecond: number): number {
  return hour * MS_PER_HOUR + minute * MS_PER_MINUTE + second * MS_PER_SECOND + millisecond
}

function timeOfMs(ms: number): [number, number, number, number] {
  return [
    Math.floor(ms / MS_PER_HOUR),
    Math.floor(ms / MS_PER_MINUTE) % 60,
    Math.floor(ms / MS_PER_SECOND) % 60,
    ms % MS_PER_SECOND,
  ]
}

/** 去掉 -0：差值与时长字段里不出现 -0。 */
function z(n: number): number {
  return n === 0 ? 0 : n
}

// —— 日期运算 ——

/** 先加年月（按 overflow 处理越界的日），再加天数，返回日序号。 */
function addToDate(year: number, month: number, day: number, years: number, months: number, days: number, overflow: Overflow): number {
  let epochDay: number
  if (years !== 0 || months !== 0) {
    const [y, m] = balanceYearMonth(year + years, month + months)
    const limit = daysInMonth(y, m)
    if (day > limit && overflow === 'reject')
      throw new RangeError(`[xh] ${y} 年 ${m} 月没有 ${day} 日`)
    epochDay = epochDayOf(y, m, Math.min(day, limit))
  }
  else {
    epochDay = epochDayOf(year, month, day)
  }
  epochDay += days
  checkEpochDay(epochDay)
  return epochDay
}

function readDateDuration(duration: DateDurationLike): [number, number, number] {
  return [
    optionalInteger(duration.years, 'years'),
    optionalInteger(duration.months, 'months'),
    optionalInteger(duration.weeks, 'weeks') * 7 + optionalInteger(duration.days, 'days'),
  ]
}

function readTimeDuration(duration: TimeDurationLike): number {
  return optionalInteger(duration.hours, 'hours') * MS_PER_HOUR
    + optionalInteger(duration.minutes, 'minutes') * MS_PER_MINUTE
    + optionalInteger(duration.seconds, 'seconds') * MS_PER_SECOND
    + optionalInteger(duration.milliseconds, 'milliseconds')
}

function negate<T extends object>(duration: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(duration))
    out[key] = typeof value === 'number' ? z(-value) : value
  return out as T
}

const DATE_UNITS: readonly DateUnit[] = ['year', 'month', 'week', 'day']
const TIME_UNITS: readonly TimeUnit[] = ['hour', 'minute', 'second', 'millisecond']

function checkUnit<U extends string>(unit: unknown, allowed: readonly U[], name: string): U {
  if (!allowed.includes(unit as U))
    throw new RangeError(`[xh] ${name} 只能是 ${allowed.join(' / ')}，收到 ${String(unit)}`)
  return unit as U
}

/**
 * 两个日期之差。取月或年时，月数取「起点按原日号挪过去不越过终点」的最大值，
 * 剩下的天数从夹过日号的中间点量起——起点加上结果恰好落在终点。
 */
function diffDate(a: PlainDateLike, b: PlainDateLike, largestUnit: DateUnit): DateDuration {
  const sign = compareFields([b.year, b.month, b.day], [a.year, a.month, a.day])
  if (sign === 0)
    return Object.freeze({ years: 0, months: 0, weeks: 0, days: 0 })
  const endDay = epochDayOf(b.year, b.month, b.day)
  if (largestUnit === 'day' || largestUnit === 'week') {
    const total = endDay - epochDayOf(a.year, a.month, a.day)
    const weeks = largestUnit === 'week' ? Math.trunc(total / 7) : 0
    return Object.freeze({ years: 0, months: 0, weeks: z(weeks), days: z(total - weeks * 7) })
  }
  let months = (b.year - a.year) * 12 + (b.month - a.month)
  const [y0, m0] = balanceYearMonth(a.year, a.month + months)
  if (sign * compareFields([y0, m0, a.day], [b.year, b.month, b.day]) > 0)
    months -= sign
  const [y, m] = balanceYearMonth(a.year, a.month + months)
  const days = endDay - epochDayOf(y, m, Math.min(a.day, daysInMonth(y, m)))
  const years = largestUnit === 'year' ? Math.trunc(months / 12) : 0
  return Object.freeze({ years: z(years), months: z(months - years * 12), weeks: 0, days: z(days) })
}

/** 毫秒差折成时分秒，最大单位由 largestUnit 决定；各字段符号一致。 */
function balanceTime(total: number, largestUnit: TimeUnit): TimeDuration {
  const sign = total < 0 ? -1 : 1
  let rest = Math.abs(total)
  const from = TIME_UNITS.indexOf(largestUnit)
  const take = (index: number, size: number): number => {
    if (index < from)
      return 0
    const value = Math.floor(rest / size)
    rest -= value * size
    return value
  }
  const hours = take(0, MS_PER_HOUR)
  const minutes = take(1, MS_PER_MINUTE)
  const seconds = take(2, MS_PER_SECOND)
  return Object.freeze({ hours: z(sign * hours), minutes: z(sign * minutes), seconds: z(sign * seconds), milliseconds: z(sign * rest) })
}

// —— 取整 ——

const ROUNDING_MODES: readonly RoundingMode[] = ['ceil', 'floor', 'expand', 'trunc', 'halfCeil', 'halfFloor', 'halfExpand', 'halfTrunc', 'halfEven']
const UNIT_MS: Readonly<Record<TimeUnit | 'day', number>> = {
  day: MS_PER_DAY,
  hour: MS_PER_HOUR,
  minute: MS_PER_MINUTE,
  second: MS_PER_SECOND,
  millisecond: 1,
}
const INCREMENT_LIMIT: Readonly<Record<TimeUnit, number>> = { hour: 24, minute: 60, second: 60, millisecond: 1000 }

/** 整数 value 按 step 的整数倍取整。 */
function roundBy(value: number, step: number, mode: RoundingMode): number {
  const lower = Math.floor(value / step)
  const remainder = value - lower * step
  if (remainder === 0)
    return value
  const upper = lower + 1
  const negative = value < 0
  const toward = negative ? upper : lower
  const away = negative ? lower : upper
  let q: number
  switch (mode) {
    case 'ceil': q = upper
      break
    case 'floor': q = lower
      break
    case 'expand': q = away
      break
    case 'trunc': q = toward
      break
    default: {
      const twice = remainder * 2
      if (twice !== step) {
        q = twice < step ? lower : upper
        break
      }
      q = mode === 'halfCeil'
        ? upper
        : mode === 'halfFloor'
          ? lower
          : mode === 'halfExpand'
            ? away
            : mode === 'halfTrunc'
              ? toward
              : (lower % 2 === 0 ? lower : upper)
    }
  }
  return q * step
}

function readRound(
  options: TimeUnit | 'day' | TimeRoundOptions | DateTimeRoundOptions,
  allowDay: boolean,
): { step: number, mode: RoundingMode } {
  const given = typeof options === 'string' ? { smallestUnit: options } : options
  const units: readonly (TimeUnit | 'day')[] = allowDay ? ['day', ...TIME_UNITS] : TIME_UNITS
  const unit = checkUnit(given.smallestUnit, units, 'smallestUnit')
  const increment = requireInteger(given.roundingIncrement ?? 1, 'roundingIncrement')
  const mode = checkUnit(given.roundingMode ?? 'halfExpand', ROUNDING_MODES, 'roundingMode')
  if (unit === 'day') {
    if (increment !== 1)
      throw new RangeError('[xh] 按天取整的步长只能是 1')
  }
  else {
    const limit = INCREMENT_LIMIT[unit]
    if (increment < 1 || (increment > 1 && (increment >= limit || limit % increment !== 0)))
      throw new RangeError(`[xh] 按 ${unit} 取整的步长须整除 ${limit} 且小于它，收到 ${increment}`)
  }
  return { step: UNIT_MS[unit] * increment, mode }
}

// —— 字符串 ——

const DATE_PATTERN = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/
const TIME_PATTERN = /^T?(\d{2})(?::(\d{2})(?::(\d{2})(?:[.,](\d{1,9}))?)?)?$/i
const DATE_TIME_PATTERN = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2})(?::(\d{2})(?::(\d{2})(?:[.,](\d{1,9}))?)?)?)?$/i

function parseYear(text: string, source: string): number {
  if (text === '-000000')
    throw new RangeError(`[xh] 年份不能写成 -000000：${source}`)
  return Number(text)
}

function parseFraction(text: string | undefined): number {
  return text ? Number(text.padEnd(3, '0').slice(0, 3)) : 0
}

function invalid(kind: string, value: unknown): RangeError {
  return new RangeError(`[xh] 不是合法的 ISO 8601 ${kind}：${JSON.stringify(value)}`)
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function yearString(year: number): string {
  if (year >= 0 && year <= 9999)
    return String(year).padStart(4, '0')
  return `${year < 0 ? '-' : '+'}${String(Math.abs(year)).padStart(6, '0')}`
}

function dateString(year: number, month: number, day: number): string {
  return `${yearString(year)}-${pad2(month)}-${pad2(day)}`
}

function timeString(hour: number, minute: number, second: number, millisecond: number, options?: TimeToStringOptions): string {
  const unit = options?.smallestUnit
  if (unit !== undefined)
    checkUnit(unit, ['minute', 'second', 'millisecond'] as const, 'smallestUnit')
  const hm = `${pad2(hour)}:${pad2(minute)}`
  if (unit === 'minute')
    return hm
  const hms = `${hm}:${pad2(second)}`
  if (unit === 'second')
    return hms
  const fraction = String(millisecond).padStart(3, '0')
  if (unit === 'millisecond')
    return `${hms}.${fraction}`
  return millisecond === 0 ? hms : `${hms}.${fraction.replace(/0+$/, '')}`
}

function noValueOf(name: string): never {
  throw new TypeError(`[xh] ${name} 不能直接比大小或做算术，请用 ${name}.compare()`)
}

// —— 值对象 ——

/** 不带时区的日期。 */
export class PlainDate {
  readonly year: number
  /** 1–12。 */
  readonly month: number
  readonly day: number

  /** 字段必须合法，越界抛 RangeError；要夹到合法值请用 PlainDate.from(fields)。 */
  constructor(year: number, month: number, day: number) {
    const [y, m, d] = regulateDate({ year, month, day }, 'reject')
    checkEpochDay(epochDayOf(y, m, d))
    this.year = y
    this.month = m
    this.day = d
    Object.freeze(this)
  }

  /**
   * 从 ISO 串（`YYYY-MM-DD`）、字段对象或另一个日期值构造。
   * 字段越界按 overflow 处理（缺省夹到合法值）；字符串一律严格，不合法抛 RangeError。
   */
  static from(item: string | PlainDateLike, options?: OverflowOptions): PlainDate {
    const overflow = overflowOf(options)
    if (typeof item === 'string') {
      const m = DATE_PATTERN.exec(item)
      if (!m)
        throw invalid('日期', item)
      return new PlainDate(parseYear(m[1]!, item), Number(m[2]), Number(m[3]))
    }
    if (item instanceof PlainDate)
      return item
    if (item === null || typeof item !== 'object')
      throw new TypeError(`[xh] PlainDate.from 需要字符串或 { year, month, day }，收到 ${String(item)}`)
    return new PlainDate(...regulateDate(item, overflow))
  }

  /** 时间点在某个时区里的日期；时区缺省为运行环境所在时区。 */
  static fromDate(instant: Date | number, timeZone: string = getLocalTimeZone()): PlainDate {
    return plainDateOfEpochDay(Math.floor(wallOf(toEpochMs(instant), timeZone) / MS_PER_DAY))
  }

  /** 先后比较：a 早于 b 为 -1，相同为 0，晚于为 1。 */
  static compare(a: PlainDateLike, b: PlainDateLike): -1 | 0 | 1 {
    return compareFields([a.year, a.month, a.day], [b.year, b.month, b.day])
  }

  /** 星期几：1 = 星期一 … 7 = 星期日。 */
  get dayOfWeek(): number {
    return isoDayOfWeek(epochDayOf(this.year, this.month, this.day))
  }

  /** 一年中的第几天，1 起。 */
  get dayOfYear(): number {
    return dayOfYearOf(this.year, this.month, this.day)
  }

  /** ISO 周序号 1–53。跨年的周归星期四所在的年，见 yearOfWeek。 */
  get weekOfYear(): number {
    return isoWeekOf(this.year, this.month, this.day).week
  }

  /** ISO 周所属的年。12 月底可能已是下一年，1 月初可能仍是上一年。 */
  get yearOfWeek(): number {
    return isoWeekOf(this.year, this.month, this.day).year
  }

  get daysInWeek(): number {
    return 7
  }

  get daysInMonth(): number {
    return daysInMonth(this.year, this.month)
  }

  get daysInYear(): number {
    return daysInYear(this.year)
  }

  get monthsInYear(): number {
    return 12
  }

  get inLeapYear(): boolean {
    return isLeapYear(this.year)
  }

  /** 换掉部分字段；越界按 overflow 处理（缺省夹到合法值：1 月 31 日换成 2 月是 2 月 28/29 日）。 */
  with(fields: Partial<PlainDateLike>, options?: OverflowOptions): PlainDate {
    return PlainDate.from({
      year: fields.year ?? this.year,
      month: fields.month ?? this.month,
      day: fields.day ?? this.day,
    }, options)
  }

  /** 加一段时长：先加年月，越界的日按 overflow 处理，再加周与日。 */
  add(duration: DateDurationLike, options?: OverflowOptions): PlainDate {
    const [years, months, days] = readDateDuration(duration)
    return plainDateOfEpochDay(addToDate(this.year, this.month, this.day, years, months, days, overflowOf(options)))
  }

  subtract(duration: DateDurationLike, options?: OverflowOptions): PlainDate {
    return this.add(negate(duration), options)
  }

  /** 从本日期到 other 的时长；other 更早时各字段为负。 */
  until(other: PlainDateLike, options?: DateDifferenceOptions): DateDuration {
    return diffDate(this, other, checkUnit(options?.largestUnit ?? 'day', DATE_UNITS, 'largestUnit'))
  }

  /** 从 other 到本日期的时长，即 until 的相反数。 */
  since(other: PlainDateLike, options?: DateDifferenceOptions): DateDuration {
    return Object.freeze(negate(this.until(other, options)))
  }

  equals(other: PlainDateLike): boolean {
    return PlainDate.compare(this, other) === 0
  }

  /** 接上一个时间（缺省 00:00）成为日期时间。 */
  toPlainDateTime(time?: PlainTimeLike): PlainDateTime {
    const [hour, minute, second, millisecond] = regulateTime(time ?? {}, 'reject')
    return new PlainDateTime(this.year, this.month, this.day, hour, minute, second, millisecond)
  }

  /** 这一天在某个时区里开始的时刻；零点被夏令时跳过时取跳过之后的第一刻。时区缺省为运行环境所在时区。 */
  toDate(timeZone: string = getLocalTimeZone()): Date {
    return new Date(instantOf(epochDayOf(this.year, this.month, this.day) * MS_PER_DAY, timeZone))
  }

  /** `YYYY-MM-DD`；0–9999 以外的年份写成 ±YYYYYY。 */
  toString(): string {
    return dateString(this.year, this.month, this.day)
  }

  toJSON(): string {
    return this.toString()
  }

  /** 按 locale 格式化；只由字段决定，与运行环境所在时区无关。 */
  toLocaleString(locales?: string | readonly string[], options?: PlainDateFormatOptions): string {
    return plainIntlFormat(locales, options, 'date').format(epochDayOf(this.year, this.month, this.day) * MS_PER_DAY)
  }

  valueOf(): never {
    return noValueOf('PlainDate')
  }
}

function plainDateOfEpochDay(epochDay: number): PlainDate {
  const [year, month, day] = civilOf(epochDay)
  return new PlainDate(year, month, day)
}

/** 不带日期与时区的时间，精度到毫秒。 */
export class PlainTime {
  /** 0–23。 */
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly millisecond: number

  /** 字段必须合法，越界抛 RangeError；要夹到合法值请用 PlainTime.from(fields)。 */
  constructor(hour = 0, minute = 0, second = 0, millisecond = 0) {
    const [h, m, s, ms] = regulateTime({ hour, minute, second, millisecond }, 'reject')
    this.hour = h
    this.minute = m
    this.second = s
    this.millisecond = ms
    Object.freeze(this)
  }

  /**
   * 从 ISO 串（`HH`、`HH:mm`、`HH:mm:ss`、`HH:mm:ss.SSS`，可带前缀 T）、字段对象或另一个时间值构造。
   * 小数秒最多九位，只保留到毫秒。
   */
  static from(item: string | PlainTimeLike, options?: OverflowOptions): PlainTime {
    const overflow = overflowOf(options)
    if (typeof item === 'string') {
      const m = TIME_PATTERN.exec(item)
      if (!m)
        throw invalid('时间', item)
      return new PlainTime(Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0), parseFraction(m[4]))
    }
    if (item instanceof PlainTime)
      return item
    if (item === null || typeof item !== 'object')
      throw new TypeError(`[xh] PlainTime.from 需要字符串或 { hour, minute, second, millisecond }，收到 ${String(item)}`)
    return new PlainTime(...regulateTime(item, overflow))
  }

  static compare(a: PlainTimeLike, b: PlainTimeLike): -1 | 0 | 1 {
    return compareFields(regulateTime(a, 'reject'), regulateTime(b, 'reject'))
  }

  with(fields: PlainTimeLike, options?: OverflowOptions): PlainTime {
    return PlainTime.from({
      hour: fields.hour ?? this.hour,
      minute: fields.minute ?? this.minute,
      second: fields.second ?? this.second,
      millisecond: fields.millisecond ?? this.millisecond,
    }, options)
  }

  /** 加一段时长，跨过午夜时绕回（23:30 加一小时是 00:30）。 */
  add(duration: TimeDurationLike): PlainTime {
    const total = msOfDayOf(this.hour, this.minute, this.second, this.millisecond) + readTimeDuration(duration)
    return new PlainTime(...timeOfMs(((total % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY))
  }

  subtract(duration: TimeDurationLike): PlainTime {
    return this.add(negate(duration))
  }

  until(other: PlainTimeLike, options?: TimeDifferenceOptions): TimeDuration {
    const unit = checkUnit(options?.largestUnit ?? 'hour', TIME_UNITS, 'largestUnit')
    const [h, m, s, ms] = regulateTime(other, 'reject')
    return balanceTime(msOfDayOf(h, m, s, ms) - msOfDayOf(this.hour, this.minute, this.second, this.millisecond), unit)
  }

  since(other: PlainTimeLike, options?: TimeDifferenceOptions): TimeDuration {
    return Object.freeze(negate(this.until(other, options)))
  }

  /** 按单位与步长取整；取整到 24:00 时绕回 00:00。 */
  round(options: TimeUnit | TimeRoundOptions): PlainTime {
    const { step, mode } = readRound(options, false)
    const rounded = roundBy(msOfDayOf(this.hour, this.minute, this.second, this.millisecond), step, mode)
    return new PlainTime(...timeOfMs(rounded % MS_PER_DAY))
  }

  equals(other: PlainTimeLike): boolean {
    return PlainTime.compare(this, other) === 0
  }

  /** `HH:mm:ss`，毫秒非零时带小数；smallestUnit 可截到分或恒带三位毫秒。 */
  toString(options?: TimeToStringOptions): string {
    return timeString(this.hour, this.minute, this.second, this.millisecond, options)
  }

  toJSON(): string {
    return this.toString()
  }

  toLocaleString(locales?: string | readonly string[], options?: PlainDateFormatOptions): string {
    return plainIntlFormat(locales, options, 'time').format(msOfDayOf(this.hour, this.minute, this.second, this.millisecond))
  }

  valueOf(): never {
    return noValueOf('PlainTime')
  }
}

/** 不带时区的日期时间。 */
export class PlainDateTime {
  readonly year: number
  /** 1–12。 */
  readonly month: number
  readonly day: number
  /** 0–23。 */
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly millisecond: number

  /** 字段必须合法，越界抛 RangeError；要夹到合法值请用 PlainDateTime.from(fields)。 */
  constructor(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0) {
    const [y, mo, d] = regulateDate({ year, month, day }, 'reject')
    const [h, mi, s, ms] = regulateTime({ hour, minute, second, millisecond }, 'reject')
    checkEpochDay(epochDayOf(y, mo, d))
    this.year = y
    this.month = mo
    this.day = d
    this.hour = h
    this.minute = mi
    this.second = s
    this.millisecond = ms
    Object.freeze(this)
  }

  /**
   * 从 ISO 串、字段对象、日期或日期时间值构造。字符串接受 `YYYY-MM-DD`（时间取 00:00）
   * 与 `YYYY-MM-DDTHH[:mm[:ss[.SSS]]]`，分隔符可以是 T 或空格。
   */
  static from(item: string | PlainDateLike | PlainDateTimeLike, options?: OverflowOptions): PlainDateTime {
    const overflow = overflowOf(options)
    if (typeof item === 'string') {
      const m = DATE_TIME_PATTERN.exec(item)
      if (!m)
        throw invalid('日期时间', item)
      return new PlainDateTime(
        parseYear(m[1]!, item),
        Number(m[2]),
        Number(m[3]),
        Number(m[4] ?? 0),
        Number(m[5] ?? 0),
        Number(m[6] ?? 0),
        parseFraction(m[7]),
      )
    }
    if (item instanceof PlainDateTime)
      return item
    if (item === null || typeof item !== 'object')
      throw new TypeError(`[xh] PlainDateTime.from 需要字符串或字段对象，收到 ${String(item)}`)
    return new PlainDateTime(...regulateDate(item, overflow), ...regulateTime(item as PlainDateTimeLike, overflow))
  }

  /** 时间点在某个时区里的日期时间；时区缺省为运行环境所在时区。 */
  static fromDate(instant: Date | number, timeZone: string = getLocalTimeZone()): PlainDateTime {
    return plainDateTimeOfWall(wallOf(toEpochMs(instant), timeZone))
  }

  static compare(a: PlainDateTimeLike, b: PlainDateTimeLike): -1 | 0 | 1 {
    return compareFields(
      [a.year, a.month, a.day, ...regulateTime(a, 'reject')],
      [b.year, b.month, b.day, ...regulateTime(b, 'reject')],
    )
  }

  get dayOfWeek(): number {
    return isoDayOfWeek(epochDayOf(this.year, this.month, this.day))
  }

  get dayOfYear(): number {
    return dayOfYearOf(this.year, this.month, this.day)
  }

  get weekOfYear(): number {
    return isoWeekOf(this.year, this.month, this.day).week
  }

  get yearOfWeek(): number {
    return isoWeekOf(this.year, this.month, this.day).year
  }

  get daysInWeek(): number {
    return 7
  }

  get daysInMonth(): number {
    return daysInMonth(this.year, this.month)
  }

  get daysInYear(): number {
    return daysInYear(this.year)
  }

  get monthsInYear(): number {
    return 12
  }

  get inLeapYear(): boolean {
    return isLeapYear(this.year)
  }

  with(fields: Partial<PlainDateTimeLike>, options?: OverflowOptions): PlainDateTime {
    return PlainDateTime.from({
      year: fields.year ?? this.year,
      month: fields.month ?? this.month,
      day: fields.day ?? this.day,
      hour: fields.hour ?? this.hour,
      minute: fields.minute ?? this.minute,
      second: fields.second ?? this.second,
      millisecond: fields.millisecond ?? this.millisecond,
    }, options)
  }

  /** 换掉时间部分；不给时间即回到当天 00:00。 */
  withPlainTime(time?: PlainTimeLike): PlainDateTime {
    const [hour, minute, second, millisecond] = regulateTime(time ?? {}, 'reject')
    return new PlainDateTime(this.year, this.month, this.day, hour, minute, second, millisecond)
  }

  /** 先加时间部分，满一天进位；再按 PlainDate.add 的规则加年月、周与日（含进位）。 */
  add(duration: DateTimeDurationLike, options?: OverflowOptions): PlainDateTime {
    const [years, months, days] = readDateDuration(duration)
    const total = msOfDayOf(this.hour, this.minute, this.second, this.millisecond) + readTimeDuration(duration)
    const carry = Math.floor(total / MS_PER_DAY)
    const epochDay = addToDate(this.year, this.month, this.day, years, months, days + carry, overflowOf(options))
    return plainDateTimeOf(epochDay, total - carry * MS_PER_DAY)
  }

  subtract(duration: DateTimeDurationLike, options?: OverflowOptions): PlainDateTime {
    return this.add(negate(duration), options)
  }

  /**
   * 到 other 的时长。largestUnit 取日期单位（缺省 day）时，时间差先与日期差同号（不同号就借一天），
   * 再按 PlainDate.until 算日期部分；取时间单位时整段差值折成该单位及以下。
   */
  until(other: PlainDateTimeLike, options?: DateTimeDifferenceOptions): DateTimeDuration {
    const unit = checkUnit(options?.largestUnit ?? 'day', [...DATE_UNITS, ...TIME_UNITS], 'largestUnit')
    const [h, mi, s, ms] = regulateTime(other, 'reject')
    const startDay = epochDayOf(this.year, this.month, this.day)
    let endDay = epochDayOf(other.year, other.month, other.day)
    let time = msOfDayOf(h, mi, s, ms) - msOfDayOf(this.hour, this.minute, this.second, this.millisecond)
    if ((TIME_UNITS as readonly string[]).includes(unit)) {
      const total = (endDay - startDay) * MS_PER_DAY + time
      return Object.freeze({ years: 0, months: 0, weeks: 0, days: 0, ...balanceTime(total, unit as TimeUnit) })
    }
    const dateSign = Math.sign(endDay - startDay)
    if (dateSign !== 0 && Math.sign(time) === -dateSign) {
      endDay -= dateSign
      time += dateSign * MS_PER_DAY
    }
    const [y, m, d] = civilOf(endDay)
    const date = diffDate(this, { year: y, month: m, day: d }, unit as DateUnit)
    return Object.freeze({ ...date, ...balanceTime(time, 'hour') })
  }

  since(other: PlainDateTimeLike, options?: DateTimeDifferenceOptions): DateTimeDuration {
    return Object.freeze(negate(this.until(other, options)))
  }

  /** 按单位与步长取整，满一天进位到下一天。 */
  round(options: TimeUnit | 'day' | DateTimeRoundOptions): PlainDateTime {
    const { step, mode } = readRound(options, true)
    const rounded = roundBy(msOfDayOf(this.hour, this.minute, this.second, this.millisecond), step, mode)
    const carry = Math.floor(rounded / MS_PER_DAY)
    const epochDay = epochDayOf(this.year, this.month, this.day) + carry
    checkEpochDay(epochDay)
    return plainDateTimeOf(epochDay, rounded - carry * MS_PER_DAY)
  }

  equals(other: PlainDateTimeLike): boolean {
    return PlainDateTime.compare(this, other) === 0
  }

  toPlainDate(): PlainDate {
    return new PlainDate(this.year, this.month, this.day)
  }

  toPlainTime(): PlainTime {
    return new PlainTime(this.hour, this.minute, this.second, this.millisecond)
  }

  /** 在某个时区里对应的时刻；夏令时跳过或重复的时间按 disambiguation 取舍。时区缺省为运行环境所在时区。 */
  toDate(timeZone: string = getLocalTimeZone(), options?: DisambiguationOptions): Date {
    const disambiguation = checkUnit(options?.disambiguation ?? 'compatible', ['compatible', 'earlier', 'later', 'reject'] as const, 'disambiguation')
    const wall = epochDayOf(this.year, this.month, this.day) * MS_PER_DAY + msOfDayOf(this.hour, this.minute, this.second, this.millisecond)
    return new Date(instantOf(wall, timeZone, disambiguation))
  }

  /** `YYYY-MM-DDTHH:mm:ss`，毫秒非零时带小数；smallestUnit 同 PlainTime.toString。 */
  toString(options?: TimeToStringOptions): string {
    return `${dateString(this.year, this.month, this.day)}T${timeString(this.hour, this.minute, this.second, this.millisecond, options)}`
  }

  toJSON(): string {
    return this.toString()
  }

  toLocaleString(locales?: string | readonly string[], options?: PlainDateFormatOptions): string {
    const wall = epochDayOf(this.year, this.month, this.day) * MS_PER_DAY + msOfDayOf(this.hour, this.minute, this.second, this.millisecond)
    return plainIntlFormat(locales, options, 'datetime').format(wall)
  }

  valueOf(): never {
    return noValueOf('PlainDateTime')
  }
}

function plainDateTimeOf(epochDay: number, msOfDay: number): PlainDateTime {
  const [year, month, day] = civilOf(epochDay)
  return new PlainDateTime(year, month, day, ...timeOfMs(msOfDay))
}

function plainDateTimeOfWall(wall: number): PlainDateTime {
  const epochDay = Math.floor(wall / MS_PER_DAY)
  return plainDateTimeOf(epochDay, wall - epochDay * MS_PER_DAY)
}

/** 值对象的墙上时间编码（当它是 UTC 时的毫秒数），供格式化等同目录模块使用。 */
export function wallMsOf(value: PlainDate | PlainTime | PlainDateTime): number {
  if (value instanceof PlainTime)
    return msOfDayOf(value.hour, value.minute, value.second, value.millisecond)
  const day = epochDayOf(value.year, value.month, value.day) * MS_PER_DAY
  return value instanceof PlainDateTime ? day + msOfDayOf(value.hour, value.minute, value.second, value.millisecond) : day
}
