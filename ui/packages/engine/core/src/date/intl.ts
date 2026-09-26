/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按 locale 格式化不带时区的日期值：把字段编码成 UTC 时间点，再以 UTC 格式化，
// 结果只由字段决定，与运行环境所在时区无关。Intl.DateTimeFormat 构造开销大，按参数缓存。

/** 构造格式化器用的参数；时区由库固定为 UTC，不接受传入。 */
export type PlainDateFormatOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone' | 'timeZoneName'>

/** 被格式化的值是哪一类：决定没给任何字段时的缺省字段。 */
export type PlainKind = 'date' | 'time' | 'datetime'

const COMPONENT_KEYS = ['weekday', 'era', 'year', 'month', 'day', 'dayPeriod', 'hour', 'minute', 'second', 'fractionalSecondDigits', 'dateStyle', 'timeStyle'] as const

const DATE_DEFAULTS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' }
const TIME_DEFAULTS: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' }

const CACHE_LIMIT = 256
const cache = new Map<string, Intl.DateTimeFormat>()

function keyOf(locales: string | readonly string[] | undefined, options: PlainDateFormatOptions, kind: PlainKind): string {
  const entries = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return JSON.stringify([kind, locales ?? null, entries])
}

/** 取（或建）一个以 UTC 格式化的 Intl.DateTimeFormat。 */
export function plainIntlFormat(
  locales: string | readonly string[] | undefined,
  options: PlainDateFormatOptions | undefined,
  kind: PlainKind,
): Intl.DateTimeFormat {
  const given = options ?? {}
  const key = keyOf(locales, given, kind)
  let format = cache.get(key)
  if (!format) {
    const hasComponent = COMPONENT_KEYS.some(k => given[k] !== undefined)
    const defaults = hasComponent
      ? {}
      : kind === 'date' ? DATE_DEFAULTS : kind === 'time' ? TIME_DEFAULTS : { ...DATE_DEFAULTS, ...TIME_DEFAULTS }
    format = new Intl.DateTimeFormat(locales as string | string[] | undefined, { ...defaults, ...given, timeZone: 'UTC' })
    if (cache.size >= CACHE_LIMIT)
      cache.delete(cache.keys().next().value!)
    cache.set(key, format)
  }
  return format
}
