/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间刻度：以目标间隔在候选表里取最近者；跨度超过一年按年数取刻度步长，不足一秒按毫秒取。

import type { TimeInterval, TimeIntervalName, TimeIntervalSet } from './interval'
import { tickStep } from '../array/ticks'
import { invalidArgument } from '../errors'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/** 候选：[间隔, 步数, 名义时长]。名义时长只用于挑选，刻度本身按日历推进。 */
const CANDIDATES: ReadonlyArray<readonly [TimeIntervalName, number, number]> = [
  ['second', 1, SECOND],
  ['second', 5, 5 * SECOND],
  ['second', 15, 15 * SECOND],
  ['second', 30, 30 * SECOND],
  ['minute', 1, MINUTE],
  ['minute', 5, 5 * MINUTE],
  ['minute', 15, 15 * MINUTE],
  ['minute', 30, 30 * MINUTE],
  ['hour', 1, HOUR],
  ['hour', 3, 3 * HOUR],
  ['hour', 6, 6 * HOUR],
  ['hour', 12, 12 * HOUR],
  ['day', 1, DAY],
  ['day', 2, 2 * DAY],
  ['week', 1, WEEK],
  ['month', 1, MONTH],
  ['month', 3, 3 * MONTH],
  ['year', 1, YEAR],
]

export interface TimeTickOptions {
  /** 周刻度从星期几开始，0 = 星期日；缺省 1（星期一）。 */
  readonly firstDayOfWeek?: number
}

export interface TimeTickInterval {
  readonly interval: TimeInterval
  /** 刻度所在的粒度，格式化刻度标签时据此决定显示到哪一级。 */
  readonly name: TimeIntervalName
}

function timeOf(date: Date, name: string): number {
  const time = +date
  if (Number.isNaN(time))
    throw invalidArgument(`${name} 不是有效日期`, { [name]: date })
  return time
}

/** 让 [start, stop] 上大约出现 count 个刻度的时间间隔；count ≤ 0 时为 null。 */
export function timeTickInterval(start: Date, stop: Date, count: number, set: TimeIntervalSet, options: TimeTickOptions = {}): TimeTickInterval | null {
  const a = timeOf(start, 'start')
  const b = timeOf(stop, 'stop')
  if (Number.isNaN(count) || count === Number.POSITIVE_INFINITY)
    throw invalidArgument('刻度数量必须是有限数', { count })
  if (!(count > 0))
    return null
  const target = Math.abs(b - a) / count
  let i = 0
  while (i < CANDIDATES.length && (CANDIDATES[i] as readonly [TimeIntervalName, number, number])[2] <= target)
    i++
  if (i === CANDIDATES.length) {
    const step = Math.max(1, Math.round(Math.abs(tickStep(a / YEAR, b / YEAR, count))))
    return { interval: set.year.every(step) as TimeInterval, name: 'year' }
  }
  if (i === 0) {
    const step = Math.max(1, Math.round(Math.abs(tickStep(a, b, count))))
    return { interval: set.millisecond.every(step) as TimeInterval, name: 'millisecond' }
  }
  const lower = CANDIDATES[i - 1] as readonly [TimeIntervalName, number, number]
  const upper = CANDIDATES[i] as readonly [TimeIntervalName, number, number]
  const [name, step] = target / lower[2] < upper[2] / target ? lower : upper
  const base = name === 'week' ? set.week(options.firstDayOfWeek ?? 1) : set[name]
  return { interval: base.every(step) as TimeInterval, name }
}

/** [start, stop] 内约 count 个时间刻度，含两端上恰好的边界；start > stop 时按降序返回。 */
export function timeTicks(start: Date, stop: Date, count: number, set: TimeIntervalSet, options: TimeTickOptions = {}): Date[] {
  const a = timeOf(start, 'start')
  const b = timeOf(stop, 'stop')
  const reverse = b < a
  const low = new Date(reverse ? b : a)
  const high = new Date(reverse ? a : b)
  const chosen = timeTickInterval(low, high, count, set, options)
  const out = chosen ? chosen.interval.range(low, new Date(+high + 1)) : []
  return reverse ? out.reverse() : out
}
