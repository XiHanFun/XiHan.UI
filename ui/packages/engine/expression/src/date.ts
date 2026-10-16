/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 不带时区的日期：前推格里历换算、加减、相差与格式化。
import { Fault } from './issues'

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000
const MIN_DAY = -719_162
const MAX_DAY = 2_932_896
const MIN_MS = MIN_DAY * MS_PER_DAY
const MAX_MS = MAX_DAY * MS_PER_DAY + MS_PER_DAY - 1

const DATE_TEXT = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/

/** 日期的组成部分。 */
export interface DateParts {
  readonly year: number
  readonly month: number
  readonly day: number
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly millisecond: number
}

/** `DATE_ADD` / `DATE_DIFF` 接受的单位。 */
export type DateUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

const FIXED_UNIT_MS: Readonly<Record<Exclude<DateUnit, 'year' | 'month'>, number>> = {
  week: 7 * MS_PER_DAY,
  day: MS_PER_DAY,
  hour: MS_PER_HOUR,
  minute: MS_PER_MINUTE,
  second: MS_PER_SECOND,
}

/** 判断文本是不是日期单位。 */
export function isDateUnit(text: string): text is DateUnit {
  return text === 'year' || text === 'month' || Object.hasOwn(FIXED_UNIT_MS, text)
}

function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor)
}

function floorMod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

/** 公历年月日到 1970-01-01 起的天数（前推格里历）。 */
export function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year
  const era = floorDiv(y, 400)
  const yearOfEra = y - era * 400
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear
  return era * 146_097 + dayOfEra - 719_468
}

/** 1970-01-01 起的天数到公历年月日。 */
export function civilFromDays(days: number): { year: number, month: number, day: number } {
  const shifted = days + 719_468
  const era = floorDiv(shifted, 146_097)
  const dayOfEra = shifted - era * 146_097
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36_524) - Math.floor(dayOfEra / 146_096)) / 365)
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100))
  const monthIndex = Math.floor((5 * dayOfYear + 2) / 153)
  const day = dayOfYear - Math.floor((153 * monthIndex + 2) / 5) + 1
  const month = monthIndex < 10 ? monthIndex + 3 : monthIndex - 9
  const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0)
  return { year, month, day }
}

/** 是否闰年。 */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

/** 某年某月的天数。 */
export function daysInMonth(year: number, month: number): number {
  if (month === 2)
    return isLeapYear(year) ? 29 : 28
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31
}

function inRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max
}

let construct: (epochMilliseconds: number) => ExprDate

/**
 * 不带时区的日期时间，精确到毫秒，范围 0001-01-01 至 9999-12-31。
 * `epochMilliseconds` 是距 1970-01-01T00:00:00 的毫秒数，按前推格里历计算，不经过任何时区。实例冻结。
 */
export class ExprDate {
  readonly epochMilliseconds: number

  static {
    construct = epochMilliseconds => new ExprDate(epochMilliseconds)
  }

  private constructor(epochMilliseconds: number) {
    this.epochMilliseconds = epochMilliseconds
    Object.freeze(this)
  }

  /** 由各组成部分构造；任一部分不是整数或越界时返回 `null`。 */
  static fromParts(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, millisecond = 0): ExprDate | null {
    if (!inRange(year, 1, 9999) || !inRange(month, 1, 12) || !inRange(day, 1, daysInMonth(year, month)))
      return null
    if (!inRange(hour, 0, 23) || !inRange(minute, 0, 59) || !inRange(second, 0, 59) || !inRange(millisecond, 0, 999))
      return null
    const days = daysFromCivil(year, month, day)
    return construct(days * MS_PER_DAY + hour * MS_PER_HOUR + minute * MS_PER_MINUTE + second * MS_PER_SECOND + millisecond)
  }

  /** 由距 1970-01-01T00:00:00 的毫秒数构造；不是整数或越界时返回 `null`。 */
  static fromEpochMilliseconds(epochMilliseconds: number): ExprDate | null {
    return inRange(epochMilliseconds, MIN_MS, MAX_MS) ? construct(epochMilliseconds) : null
  }

  /**
   * 解析 `YYYY-MM-DD`，可带 `T` 或空格分隔的 `HH:mm`、`HH:mm:ss`、`HH:mm:ss.fff`（小数 1–9 位，截到毫秒）。
   * 时间后可带 `Z` 或 `±HH:mm` 偏移，偏移被丢弃、保留墙钟时间。不合法时返回 `null`。
   */
  static parse(text: string): ExprDate | null {
    const match = DATE_TEXT.exec(text)
    if (match === null)
      return null
    const [, year = '', month = '', day = '', hour = '0', minute = '0', second = '0', fraction = ''] = match
    const millisecond = fraction === '' ? 0 : Number(fraction.padEnd(3, '0').slice(0, 3))
    return ExprDate.fromParts(Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second), millisecond)
  }

  /** 各组成部分。 */
  get parts(): DateParts {
    const days = floorDiv(this.epochMilliseconds, MS_PER_DAY)
    const { year, month, day } = civilFromDays(days)
    const time = this.epochMilliseconds - days * MS_PER_DAY
    return {
      year,
      month,
      day,
      hour: Math.floor(time / MS_PER_HOUR),
      minute: Math.floor((time % MS_PER_HOUR) / MS_PER_MINUTE),
      second: Math.floor((time % MS_PER_MINUTE) / MS_PER_SECOND),
      millisecond: time % MS_PER_SECOND,
    }
  }

  /** ISO 星期：周一为 1，周日为 7。 */
  get weekday(): number {
    return floorMod(floorDiv(this.epochMilliseconds, MS_PER_DAY) + 3, 7) + 1
  }

  /** 是否与另一个日期相等。 */
  equals(other: ExprDate): boolean {
    return this.epochMilliseconds === other.epochMilliseconds
  }

  /** 比较先后：早于、相同、晚于分别返回 -1、0、1。 */
  compare(other: ExprDate): -1 | 0 | 1 {
    return this.epochMilliseconds < other.epochMilliseconds ? -1 : this.epochMilliseconds > other.epochMilliseconds ? 1 : 0
  }

  /** 规范文本：时刻为零点时是 `YYYY-MM-DD`，否则是 `YYYY-MM-DDTHH:mm:ss`，毫秒不为 0 时再带 `.SSS`。 */
  toString(): string {
    const p = this.parts
    const date = `${pad(p.year, 4)}-${pad(p.month, 2)}-${pad(p.day, 2)}`
    if (p.hour === 0 && p.minute === 0 && p.second === 0 && p.millisecond === 0)
      return date
    const time = `${pad(p.hour, 2)}:${pad(p.minute, 2)}:${pad(p.second, 2)}`
    return p.millisecond === 0 ? `${date}T${time}` : `${date}T${time}.${pad(p.millisecond, 3)}`
  }

  toJSON(): string {
    return this.toString()
  }
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0')
}

/** 取日期当天零点。 */
export function startOfDay(date: ExprDate): ExprDate {
  return construct(floorDiv(date.epochMilliseconds, MS_PER_DAY) * MS_PER_DAY)
}

function addMonths(date: ExprDate, months: number): ExprDate | Fault {
  const p = date.parts
  const total = p.year * 12 + (p.month - 1) + months
  const year = floorDiv(total, 12)
  const month = floorMod(total, 12) + 1
  if (year < 1 || year > 9999)
    return new Fault('XH_EXPR_DATE_OUT_OF_RANGE')
  const day = Math.min(p.day, daysInMonth(year, month))
  const time = date.epochMilliseconds - floorDiv(date.epochMilliseconds, MS_PER_DAY) * MS_PER_DAY
  return construct(daysFromCivil(year, month, day) * MS_PER_DAY + time)
}

/** 加上整数个单位；按月、年加时日号超出目标月天数则取月末。 */
export function addToDate(date: ExprDate, amount: number, unit: DateUnit): ExprDate | Fault {
  if (unit === 'year' || unit === 'month') {
    if (Math.abs(amount) > 200_000)
      return new Fault('XH_EXPR_DATE_OUT_OF_RANGE')
    return addMonths(date, unit === 'year' ? amount * 12 : amount)
  }
  const result = date.epochMilliseconds + amount * FIXED_UNIT_MS[unit]
  return result >= MIN_MS && result <= MAX_MS ? construct(result) : new Fault('XH_EXPR_DATE_OUT_OF_RANGE')
}

function wholeMonthsBetween(start: ExprDate, end: ExprDate): number {
  const a = start.parts
  const b = end.parts
  let months = (b.year - a.year) * 12 + (b.month - a.month)
  if (months > 0 && (addMonths(start, months) as ExprDate).epochMilliseconds > end.epochMilliseconds)
    months -= 1
  else if (months < 0 && (addMonths(start, months) as ExprDate).epochMilliseconds < end.epochMilliseconds)
    months += 1
  return months
}

/** 从 `start` 到 `end` 经过的完整单位数，带符号，向零截断。 */
export function diffDates(start: ExprDate, end: ExprDate, unit: DateUnit): number {
  if (unit === 'month')
    return wholeMonthsBetween(start, end)
  if (unit === 'year')
    return Math.trunc(wholeMonthsBetween(start, end) / 12)
  const span = end.epochMilliseconds - start.epochMilliseconds
  const size = FIXED_UNIT_MS[unit]
  return (span - (span % size)) / size
}

const FORMAT_TOKENS = ['yyyy', 'SSS', 'yy', 'MM', 'dd', 'HH', 'mm', 'ss', 'M', 'd', 'H', 'm', 's'] as const

function formatToken(token: (typeof FORMAT_TOKENS)[number], p: DateParts): string {
  switch (token) {
    case 'yyyy': return pad(p.year, 4)
    case 'yy': return pad(p.year % 100, 2)
    case 'MM': return pad(p.month, 2)
    case 'M': return String(p.month)
    case 'dd': return pad(p.day, 2)
    case 'd': return String(p.day)
    case 'HH': return pad(p.hour, 2)
    case 'H': return String(p.hour)
    case 'mm': return pad(p.minute, 2)
    case 'm': return String(p.minute)
    case 'ss': return pad(p.second, 2)
    case 's': return String(p.second)
    case 'SSS': return pad(p.millisecond, 3)
  }
}

/** 读一段单引号括起的原样文本，返回文本与结束位置；`''` 表示一个单引号，未闭合时读到末尾。 */
function readQuoted(pattern: string, open: number): { text: string, next: number } {
  let text = ''
  let index = open + 1
  while (index < pattern.length) {
    const char = pattern[index]!
    if (char === '\'') {
      if (pattern[index + 1] !== '\'')
        return { text, next: index + 1 }
      text += '\''
      index += 2
      continue
    }
    text += char
    index += 1
  }
  return { text, next: index }
}

/**
 * 按模式格式化：`yyyy yy MM M dd d HH H mm m ss s SSS` 是占位符，单引号括起的内容原样输出，
 * 无论在不在括起的内容里，两个连续单引号都输出一个单引号，其余字符原样输出。
 */
export function formatDate(date: ExprDate, pattern: string): string {
  const p = date.parts
  let out = ''
  let index = 0
  while (index < pattern.length) {
    const char = pattern[index]!
    if (char === '\'') {
      if (pattern[index + 1] === '\'') {
        out += '\''
        index += 2
        continue
      }
      const quoted = readQuoted(pattern, index)
      out += quoted.text
      index = quoted.next
      continue
    }
    const token = FORMAT_TOKENS.find(candidate => pattern.startsWith(candidate, index))
    if (token === undefined) {
      out += char
      index += 1
    }
    else {
      out += formatToken(token, p)
      index += token.length
    }
  }
  return out
}
