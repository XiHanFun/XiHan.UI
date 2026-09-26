/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 可复用的格式化器：一组参数建一次，反复格式化日期、时间与日期时间值。

import type { PlainDateFormatOptions, PlainKind } from './intl'
import { plainIntlFormat } from './intl'
import { PlainDate, PlainDateTime, PlainTime, wallMsOf } from './plain'

type PlainValue = PlainDate | PlainTime | PlainDateTime

/** 按 locale 格式化不带时区的日期值；结果只由字段决定，与运行环境所在时区无关。 */
export interface PlainDateFormatter {
  format: (value: PlainValue) => string
  formatToParts: (value: PlainValue) => Intl.DateTimeFormatPart[]
  /** 两端须是同一类值。 */
  formatRange: (start: PlainValue, end: PlainValue) => string
  formatRangeToParts: (start: PlainValue, end: PlainValue) => Intl.DateTimeRangeFormatPart[]
  /** 按日期值解析出的参数；没给任何字段时是日期的缺省字段。 */
  resolvedOptions: () => Intl.ResolvedDateTimeFormatOptions
}

function kindOf(value: PlainValue): PlainKind {
  if (value instanceof PlainDateTime)
    return 'datetime'
  if (value instanceof PlainTime)
    return 'time'
  if (value instanceof PlainDate)
    return 'date'
  throw new TypeError(`[xh] 只能格式化 PlainDate / PlainTime / PlainDateTime，收到 ${String(value)}`)
}

function rangeKind(start: PlainValue, end: PlainValue): PlainKind {
  const kind = kindOf(start)
  if (kindOf(end) !== kind)
    throw new TypeError('[xh] formatRange 的两端须是同一类值')
  return kind
}

/**
 * 建一个格式化器。options 不含时区：值本身不带时区，字段原样呈现。
 * 没给任何日期或时间字段时，日期按年月日、时间按时分秒、日期时间两者都有。
 */
export function createDateFormatter(locales?: string | readonly string[], options?: PlainDateFormatOptions): PlainDateFormatter {
  // 同一个格式化器常在循环里用（月历逐格），按值的类别各记一份，不必每次都查全局缓存
  const own: Partial<Record<PlainKind, Intl.DateTimeFormat>> = {}
  const intl = (kind: PlainKind): Intl.DateTimeFormat => (own[kind] ??= plainIntlFormat(locales, options, kind))
  return {
    format: value => intl(kindOf(value)).format(wallMsOf(value)),
    formatToParts: value => intl(kindOf(value)).formatToParts(wallMsOf(value)),
    formatRange: (start, end) => intl(rangeKind(start, end)).formatRange(wallMsOf(start), wallMsOf(end)),
    formatRangeToParts: (start, end) => intl(rangeKind(start, end)).formatRangeToParts(wallMsOf(start), wallMsOf(end)),
    resolvedOptions: () => intl('date').resolvedOptions(),
  }
}
