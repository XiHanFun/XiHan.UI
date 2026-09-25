/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间格式：刻度标签按日期落在哪一级边界上决定显示到哪一级（跨年显示年、跨月显示月）；完整格式用于提示框与可及名。

import type { TimeIntervalName } from '../time/interval'
import { invalidArgument } from '../errors'

/** 时间粒度由细到粗；week 的标签与 day 相同。 */
const LEVELS: readonly TimeIntervalName[] = ['millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year']

const TICK_OPTIONS: Readonly<Record<TimeIntervalName, Intl.DateTimeFormatOptions>> = {
  millisecond: { minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 },
  second: { hour: 'numeric', minute: '2-digit', second: '2-digit' },
  minute: { hour: 'numeric', minute: '2-digit' },
  hour: { hour: 'numeric', minute: '2-digit' },
  day: { month: 'short', day: 'numeric' },
  week: { month: 'short', day: 'numeric' },
  month: { month: 'short' },
  year: { year: 'numeric' },
}

const FULL_OPTIONS: Readonly<Record<TimeIntervalName, Intl.DateTimeFormatOptions>> = {
  millisecond: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 },
  second: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' },
  minute: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  hour: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  day: { year: 'numeric', month: 'short', day: 'numeric' },
  week: { year: 'numeric', month: 'short', day: 'numeric' },
  month: { year: 'numeric', month: 'long' },
  year: { year: 'numeric' },
}

export interface TimeFormat {
  /** 刻度标签：interval 是刻度所在的粒度；日期恰好落在更粗一级的边界上时改用那一级（1 月 1 日显示年份）。 */
  readonly tick: (date: Date, interval: TimeIntervalName) => string
  /** 完整标签：带到 granularity 这一级的全部字段，用于提示框与可及名。 */
  readonly full: (date: Date, granularity: TimeIntervalName) => string
}

interface Fields {
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

/** 日期在目标时区里的月、日、时、分、秒、毫秒；判断落在哪一级边界只需要这些。 */
function fieldReader(timeZone: string | undefined): (date: Date) => Fields {
  if (timeZone === undefined) {
    return date => ({
      month: date.getMonth(),
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    })
  }
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
  return (date) => {
    const out: Record<string, number> = {}
    for (const part of parts.formatToParts(date))
      out[part.type] = Number(part.value)
    const time = +date
    return {
      month: (out.month as number) - 1,
      day: out.day as number,
      hour: out.hour as number,
      minute: out.minute as number,
      second: out.second as number,
      millisecond: ((time % 1000) + 1000) % 1000,
    }
  }
}

/** 日期恰好落在的最粗一级边界。 */
function alignedLevel(f: Fields): TimeIntervalName {
  if (f.millisecond !== 0)
    return 'millisecond'
  if (f.second !== 0)
    return 'second'
  if (f.minute !== 0)
    return 'minute'
  if (f.hour !== 0)
    return 'hour'
  if (f.day !== 1)
    return 'day'
  return f.month !== 0 ? 'month' : 'year'
}

/** 按语言与时区返回时间格式；timeZone 缺省为运行环境所在时区。 */
export function createTimeFormat(locale: string, timeZone?: string): TimeFormat {
  const formats = new Map<string, Intl.DateTimeFormat>()
  const formatWith = (options: Intl.DateTimeFormatOptions, key: string): Intl.DateTimeFormat => {
    let format = formats.get(key)
    if (!format) {
      try {
        format = new Intl.DateTimeFormat(locale, timeZone === undefined ? options : { ...options, timeZone })
      }
      catch (error) {
        throw invalidArgument('时间格式参数不合法', { locale, timeZone, reason: (error as Error).message })
      }
      formats.set(key, format)
    }
    return format
  }
  // 构造一次，把非法的语言标签与时区尽早报出来
  formatWith(TICK_OPTIONS.year, 'tick:year')
  const read = fieldReader(timeZone)

  const check = (date: Date, level: TimeIntervalName): void => {
    if (Number.isNaN(+date))
      throw invalidArgument('date 不是有效日期', { date })
    if (!LEVELS.includes(level))
      throw invalidArgument('未知的时间粒度', { level })
  }

  return Object.freeze({
    tick(date: Date, interval: TimeIntervalName): string {
      check(date, interval)
      const aligned = alignedLevel(read(date))
      const level = LEVELS.indexOf(aligned) > LEVELS.indexOf(interval) ? aligned : interval
      return formatWith(TICK_OPTIONS[level], `tick:${level}`).format(date)
    },
    full(date: Date, granularity: TimeIntervalName): string {
      check(date, granularity)
      return formatWith(FULL_OPTIONS[granularity], `full:${granularity}`).format(date)
    },
  })
}
