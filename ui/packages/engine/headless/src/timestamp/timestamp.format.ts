/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间格式化的纯函数：不碰 DOM、不认识解剖，把一个时刻翻成给人看的文本与给机器读的戳。
//
// 用词与缺省格式交给 Intl（RelativeTimeFormat / DateTimeFormat），任何语言都有对应的写法。
// 不给时区时取运行时自己的年月日时分秒，显示与 datetime 用同一个墙钟，datetime 不带偏移量——
// 带偏移量就等于替宿主宣称了一个时区。给了时区（IANA 名）时两者都按那个时区的墙钟，
// datetime 随之带上该时区在那一刻的偏移量。

import { isValidTimeZone, PlainDateTime, ZonedDateTime } from '@xihan-ui/core/date'

/** 三种呈现方式：只到日、到秒、以及相对现在的说法。 */
export type TimestampType = 'date' | 'datetime' | 'relative'

/** 可以当时刻用的三种写法。 */
export type TimestampValue = Date | number | string

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** 相对说法的上界：离现在更远的时刻改报绝对日期，「四百多天前」没人读得出是哪天。 */
export const TIMESTAMP_RELATIVE_LIMIT = 30 * DAY

/** setTimeout 能表达的最长延时（有符号 32 位整数毫秒）。 */
const MAX_TIMER_DELAY = 2 ** 31 - 1

/** 只写年月日的那种串。 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** 带时分、不带偏移量的日期时间串：它说的是一个墙钟读数，归属哪个时区由调用方决定。 */
const WALL_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/

/** 时区名是否可用：未提供视为可用（按运行时本地），给了却认不出视为不可用。 */
export function isTimestampTimeZone(timeZone: string | undefined): boolean {
  return timeZone === undefined || isValidTimeZone(timeZone)
}

/**
 * 把一个时刻解析成 Date；认不出时返回 undefined。
 *
 * 只写年月日的串（`2026-08-11`）会被 Date 按 UTC 零点解读，而带时分秒的串按本地解读——
 * 同一批数据里两种写法会差出一天。这里把只写年月日的串也按零点建，两种写法对齐。
 * 给了时区时，不带偏移量的串按那个时区的墙钟解读；带偏移量或 `Z` 的串、数字与 Date 本来就是确切时刻，不受影响。
 */
export function toTimeDate(value: TimestampValue | undefined | null, timeZone?: string): Date | undefined {
  if (value == null)
    return undefined
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value === 'number')
    return Number.isFinite(value) ? new Date(value) : undefined

  const text = value.trim()
  if (text === '')
    return undefined
  if (timeZone !== undefined && (DATE_ONLY.test(text) || WALL_DATE_TIME.test(text))) {
    try {
      const wall = PlainDateTime.from(text.replace(' ', 'T'))
      return ZonedDateTime.fromPlainDateTime(wall, timeZone).toDate()
    }
    catch {
      return undefined
    }
  }
  if (DATE_ONLY.test(text)) {
    const [year, month, day] = text.split('-').map(Number) as [number, number, number]
    return new Date(year, month - 1, day)
  }
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** 一个时刻在某个时区（或运行时本地）的墙钟读数。 */
interface WallFields {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function wallOf(date: Date, timeZone: string | undefined): WallFields {
  if (timeZone !== undefined) {
    const zoned = ZonedDateTime.fromDate(date, timeZone)
    return { year: zoned.year, month: zoned.month, day: zoned.day, hour: zoned.hour, minute: zoned.minute, second: zoned.second }
  }
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * 格式串里认得的记号，长的排在前面：正则的分支是先到先得，
 * `M` 排在 `MM` 前面的话两位月份会被拆成两次一位月份。
 */
const TOKEN = /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g

/**
 * 按格式串把一个时刻铺成文本。给了时区时取那个时区的墙钟。
 *
 * 一遍扫完，换上去的数字不会再被当成记号回扫：分两遍替换的话，
 * 先换出来的年份里那两位数字会在下一遍里被别的记号啃掉。
 * 记号之外的字符原样留着，没有转义写法——要写字面量的 `M`，换个不含记号的写法。
 */
export function formatTimePattern(date: Date, pattern: string, timeZone?: string): string {
  const { year, month, day, hour, minute, second } = wallOf(date, timeZone)

  return pattern.replace(TOKEN, (token) => {
    switch (token) {
      case 'YYYY': return String(year)
      case 'YY': return pad2(((year % 100) + 100) % 100)
      case 'MM': return pad2(month)
      case 'M': return String(month)
      case 'DD': return pad2(day)
      case 'D': return String(day)
      case 'HH': return pad2(hour)
      case 'H': return String(hour)
      case 'mm': return pad2(minute)
      case 'm': return String(minute)
      case 'ss': return pad2(second)
      default: return String(second)
    }
  })
}

/** 缺省的绝对格式：两位的月日，datetime 另带 24 小时制的时分秒。 */
const DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTIONS,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
}

/** 格式化器缓存：相对型会定时刷新，每次新建 Intl 对象太贵。 */
const dateFormatters = new Map<string, Intl.DateTimeFormat>()
const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>()

function dateFormatter(locale: string, withTime: boolean, timeZone: string | undefined): Intl.DateTimeFormat {
  const key = `${locale}|${withTime ? 't' : 'd'}|${timeZone ?? ''}`
  let formatter = dateFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...(withTime ? DATETIME_OPTIONS : DATE_OPTIONS), timeZone })
    dateFormatters.set(key, formatter)
  }
  return formatter
}

function relativeFormatter(locale: string, numeric: 'always' | 'auto'): Intl.RelativeTimeFormat {
  const key = `${locale}|${numeric}`
  let formatter = relativeFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric })
    relativeFormatters.set(key, formatter)
  }
  return formatter
}

/**
 * 按该语言的缺省写法铺一个绝对时刻：date 只到日，其余到秒（24 小时制）。给了时区时取那个时区的墙钟。
 */
export function formatTimestampDate(date: Date, type: TimestampType, locale: string, timeZone?: string): string {
  return dateFormatter(locale, type === 'datetime', timeZone).format(date)
}

/** 一分钟以内的说法：该语言的「现在」（Intl 的零秒相对说法）。 */
export function timestampJustNow(locale: string): string {
  return relativeFormatter(locale, 'auto').format(0, 'second')
}

/**
 * 相对说法：一分钟以内是「现在」，其余按分钟 / 小时 / 天取整，过去与将来都认
 * （「30 分钟前」「5 分钟后」）；离现在三十天及以上返回 undefined，由调用方改报绝对日期。
 *
 * 取整一律向零：过去一分半钟是「1 分钟前」，将来一分半钟是「1 分钟后」。
 * `justNow` 给了就替换「现在」那一档的说法。
 */
export function formatRelativeTime(date: Date, now: Date, locale: string, justNow?: string): string | undefined {
  const elapsed = now.getTime() - date.getTime()
  const distance = Math.abs(elapsed)
  if (distance >= TIMESTAMP_RELATIVE_LIMIT)
    return undefined
  if (distance < MINUTE)
    return justNow ?? timestampJustNow(locale)
  const [unit, size]: [Intl.RelativeTimeFormatUnit, number] = distance < HOUR
    ? ['minute', MINUTE]
    : distance < DAY ? ['hour', HOUR] : ['day', DAY]
  const count = Math.floor(distance / size)
  return relativeFormatter(locale, 'always').format(elapsed > 0 ? -count : count, unit)
}

/**
 * 相对说法下一次会变的时刻距现在多久（毫秒）；没必要再刷新时返回 null。
 *
 * 文字只在跨过取整的边界时才变：分钟档一分钟最多变一次，小时档一小时一次，天档一天一次，
 * 所以只在边界上刷新，不按固定节拍空转。已经退回绝对日期的过去时刻不会再变回相对说法，不必刷新；
 * 三十天之后的将来时刻等它进入三十天再刷新。
 */
export function timestampRefreshDelay(date: Date, now: Date): number | null {
  const elapsed = now.getTime() - date.getTime()
  const distance = Math.abs(elapsed)
  let delay: number
  if (elapsed >= TIMESTAMP_RELATIVE_LIMIT) {
    return null
  }
  else if (distance >= TIMESTAMP_RELATIVE_LIMIT) {
    delay = distance - TIMESTAMP_RELATIVE_LIMIT + 1
  }
  else if (distance < MINUTE) {
    delay = MINUTE - elapsed
  }
  else {
    const size = distance < HOUR ? MINUTE : distance < DAY ? HOUR : DAY
    const count = Math.floor(distance / size)
    // 过去的时刻越走越远：到下一个整数倍就变；将来的时刻越走越近：跌破当前整数倍就变
    delay = elapsed > 0 ? (count + 1) * size - distance : distance - count * size + 1
  }
  return Math.min(Math.max(delay, 1), MAX_TIMER_DELAY)
}

/**
 * 给机器读的那个戳，写进 `datetime`。
 * 精度跟着呈现方式走：只到日的那种给日期串，其余给到秒的日期时间串。
 * 相对说法底下仍是一个确切时刻，故与 datetime 型同样给到秒。
 * 给了时区时取那个时区的墙钟，到秒的戳另带该时区在那一刻的偏移量。
 */
export function timestampMachineStamp(date: Date, type: TimestampType, timeZone?: string): string {
  if (type === 'date')
    return formatTimePattern(date, 'YYYY-MM-DD', timeZone)
  const wall = formatTimePattern(date, 'YYYY-MM-DDTHH:mm:ss', timeZone)
  return timeZone === undefined ? wall : `${wall}${ZonedDateTime.fromDate(date, timeZone).offset}`
}
