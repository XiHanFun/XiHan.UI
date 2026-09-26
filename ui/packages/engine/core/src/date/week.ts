/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按地区划分的周：周首日与周末。数据取自 Unicode CLDR 48 的 weekData，
// 只列与世界缺省（周一起、周六周日为周末）不同的地区。
// 不向 Intl.Locale#getWeekInfo 询问：各浏览器支持与数据版本不一，同一个 locale 会排出不同的月历。

import type { PlainDate, PlainDateTime } from './plain'
import type { DayOfWeek } from './types'
import { daysInMonth, epochDayOf, isoDayOfWeek, requireInteger } from './calendar'

/** 一个 locale 的周规则。 */
export interface WeekInfo {
  /** 一周从星期几开始：1 = 星期一 … 7 = 星期日。 */
  readonly firstDay: DayOfWeek
  /** 周末是哪几天，升序。 */
  readonly weekend: readonly DayOfWeek[]
}

/** 周首日的来源：locale（按地区查表），或直接给出星期几（1 = 星期一 … 7 = 星期日）。 */
export type WeekStart = string | DayOfWeek

const FIRST_DAY_GROUPS: ReadonlyArray<readonly [DayOfWeek, string]> = [
  [5, 'MV'],
  [6, 'AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'],
  [7, 'AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'],
]

const WEEKEND_GROUPS: ReadonlyArray<readonly [readonly DayOfWeek[], string]> = [
  [[5], 'IR'],
  [[7], 'IN UG'],
  [[4, 5], 'AF'],
  [[5, 6], 'BH DZ EG IL IQ JO KW LY OM QA SA SD SY YE'],
]

function tableOf<V>(groups: ReadonlyArray<readonly [V, string]>): Map<string, V> {
  const table = new Map<string, V>()
  for (const [value, regions] of groups) {
    for (const region of regions.split(' '))
      table.set(region, value)
  }
  return table
}

let firstDayTable: Map<string, DayOfWeek> | undefined
let weekendTable: Map<string, readonly DayOfWeek[]> | undefined

const DEFAULT_WEEKEND: readonly DayOfWeek[] = Object.freeze([6, 7] as DayOfWeek[])

const FW_DAYS: Readonly<Record<string, DayOfWeek>> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 }

/** 读 Unicode 扩展（-u-）里某个键的值；没有就是 undefined。 */
function unicodeKeyword(tag: string, key: string): string | undefined {
  const subtags = tag.toLowerCase().split(/[-_]/)
  const start = subtags.indexOf('u')
  if (start < 0)
    return undefined
  for (let i = start + 1; i < subtags.length; i += 1) {
    const subtag = subtags[i]!
    // 下一个单字母子标签开始另一段扩展
    if (subtag.length === 1)
      return undefined
    if (subtag === key) {
      const values: string[] = []
      for (let j = i + 1; j < subtags.length && subtags[j]!.length > 2; j += 1)
        values.push(subtags[j]!)
      return values.join('-')
    }
  }
  return undefined
}

/** locale 所属的地区：-u-rg- 覆写优先，其次显式地区，再次按语言推断（zh → CN，ar → EG）。 */
function regionOf(locale: string): string | undefined {
  const rg = unicodeKeyword(locale, 'rg')
  if (rg && /^[a-z]{2}/.test(rg))
    return rg.slice(0, 2).toUpperCase()
  const tag = new Intl.Locale(locale)
  return tag.region ?? tag.maximize().region
}

const cache = new Map<string, WeekInfo>()

/**
 * locale 的周首日与周末。认 `-u-fw-`（如 `en-US-u-fw-mon`）与 `-u-ca-iso8601`（周一起）；
 * 不合法的 locale 抛 RangeError。
 */
export function getWeekInfo(locale: string): WeekInfo {
  let info = cache.get(locale)
  if (!info) {
    firstDayTable ??= tableOf(FIRST_DAY_GROUPS)
    weekendTable ??= tableOf(WEEKEND_GROUPS)
    const region = regionOf(locale)
    const fw = FW_DAYS[unicodeKeyword(locale, 'fw') ?? '']
    const firstDay = fw ?? (unicodeKeyword(locale, 'ca') === 'iso8601' ? 1 : (region && firstDayTable.get(region)) || 1)
    const weekend = (region && weekendTable.get(region)) || DEFAULT_WEEKEND
    info = Object.freeze({ firstDay, weekend: Object.freeze([...weekend]) })
    cache.set(locale, info)
  }
  return info
}

function firstDayOf(weekStart: WeekStart): DayOfWeek {
  if (typeof weekStart === 'string')
    return getWeekInfo(weekStart).firstDay
  const day = requireInteger(weekStart, 'weekStart')
  if (day < 1 || day > 7)
    throw new RangeError(`[xh] weekStart 须在 1–7 之间，收到 ${day}`)
  return day as DayOfWeek
}

/** 这一天在它那一周里排第几，0 起，0 即周首日。 */
export function dayOfWeekIn(date: PlainDate | PlainDateTime, weekStart: WeekStart): number {
  return (date.dayOfWeek - firstDayOf(weekStart) + 7) % 7
}

/** 所在那一周的第一天；日期时间保留时间部分。 */
export function startOfWeek<T extends PlainDate | PlainDateTime>(date: T, weekStart: WeekStart): T {
  return date.subtract({ days: dayOfWeekIn(date, weekStart) }) as T
}

/** 所在那一周的最后一天；日期时间保留时间部分。 */
export function endOfWeek<T extends PlainDate | PlainDateTime>(date: T, weekStart: WeekStart): T {
  return date.add({ days: 6 - dayOfWeekIn(date, weekStart) }) as T
}

/** 所在月份在月历上占几行（4–6）：从当月首日所在周排到末日所在周。 */
export function weeksInMonth(date: PlainDate | PlainDateTime, weekStart: WeekStart): number {
  const lead = (isoDayOfWeek(epochDayOf(date.year, date.month, 1)) - firstDayOf(weekStart) + 7) % 7
  return Math.ceil((lead + daysInMonth(date.year, date.month)) / 7)
}

/** 这一天在该 locale 里是否周末。 */
export function isWeekend(date: PlainDate | PlainDateTime, locale: string): boolean {
  return getWeekInfo(locale).weekend.includes(date.dayOfWeek as DayOfWeek)
}
