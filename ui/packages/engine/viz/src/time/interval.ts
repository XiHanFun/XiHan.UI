/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间间隔：毫秒到年的取整、偏移、区间与计数。时、分、秒按绝对时长推进；日、周、月、年按日历推进，跨夏令时的一天不是 24 小时。

import type { TimeCalendar } from './calendar'
import { invalidArgument } from '../errors'
import { dayNumber, localCalendar, utcCalendar } from './calendar'

/** 时间间隔。所有方法都返回新的 Date，不修改传入的日期。 */
export interface TimeInterval {
  /** 不晚于 date 的最近边界。 */
  floor: (date: Date) => Date
  /** 不早于 date 的最近边界。 */
  ceil: (date: Date) => Date
  /** 离 date 最近的边界；距离相等取较晚者。 */
  round: (date: Date) => Date
  /** 推进 step 个间隔（缺省 1，可为负；小数向下取整）。不先取整，墙上时间的零头原样保留。 */
  offset: (date: Date, step?: number) => Date
  /** [start, stop) 内每隔 step 个间隔的边界。 */
  range: (start: Date, stop: Date, step?: number) => Date[]
  /** start 之后、end 及以前的边界个数。 */
  count: (start: Date, end: Date) => number
  /** 只保留每 step 个的边界（按该间隔在上一级里的序号取余，如每 15 分钟落在 0、15、30、45 分）。step 不是正整数时为 null。 */
  every: (step: number) => TimeInterval | null
}

export type TimeIntervalName = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export interface TimeIntervalSet {
  readonly millisecond: TimeInterval
  readonly second: TimeInterval
  readonly minute: TimeInterval
  readonly hour: TimeInterval
  readonly day: TimeInterval
  /** firstDay：一周从星期几开始，0 = 星期日。 */
  readonly week: (firstDay: number) => TimeInterval
  readonly month: TimeInterval
  readonly year: TimeInterval
}

/** 间隔在 epoch 毫秒上的实现。floor 与 offset 的结果都是边界或按间隔平移后的时间点。 */
interface IntervalCore {
  floor: (time: number) => number
  offset: (time: number, step: number) => number
  /** 两个已取整的边界之间相隔几个间隔。 */
  count: (from: number, to: number) => number
  /** every 取余用的序号；缺省按自 epoch 起的间隔数取余。 */
  field?: (time: number) => number
  /** 自定义 every（毫秒与年按绝对倍数取整，不走过滤）。 */
  every?: (step: number) => IntervalCore
}

function timeOf(date: Date, name: string): number {
  const time = +date
  if (Number.isNaN(time))
    throw invalidArgument(`${name} 不是有效日期`, { [name]: date })
  return time
}

function stepOf(step: number): number {
  if (!Number.isFinite(step))
    throw invalidArgument('间隔步数必须是有限数', { step })
  return Math.floor(step)
}

/** 只保留满足 test 的边界：取整时往回找，偏移时逐个跳过不满足的边界。 */
function filterCore(core: IntervalCore, test: (time: number) => boolean): IntervalCore {
  return {
    floor(time) {
      let t = core.floor(time)
      while (!test(t))
        t = core.floor(t - 1)
      return t
    },
    offset(time, step) {
      let t = time
      const direction = step < 0 ? -1 : 1
      for (let n = Math.abs(step); n > 0; n--) {
        do t = core.offset(t, direction)
        while (!test(t))
      }
      return t
    },
    count(from, to) {
      let n = 0
      for (let t = core.floor(core.offset(from, 1)); t <= to; t = core.floor(core.offset(t, 1))) {
        if (test(t))
          n++
      }
      return n
    },
  }
}

function toInterval(core: IntervalCore): TimeInterval {
  const floor = (time: number): number => core.floor(time)
  const ceil = (time: number): number => core.floor(core.offset(core.floor(time - 1), 1))
  return Object.freeze({
    floor: (date: Date) => new Date(floor(timeOf(date, 'date'))),
    ceil: (date: Date) => new Date(ceil(timeOf(date, 'date'))),
    round(date: Date): Date {
      const time = timeOf(date, 'date')
      const low = floor(time)
      const high = ceil(time)
      return new Date(time - low < high - time ? low : high)
    },
    offset: (date: Date, step = 1) => new Date(core.offset(timeOf(date, 'date'), stepOf(step))),
    range(start: Date, stop: Date, step = 1): Date[] {
      const end = timeOf(stop, 'stop')
      const n = stepOf(step)
      const out: Date[] = []
      let t = ceil(timeOf(start, 'start'))
      if (!(n > 0))
        return out
      while (t < end) {
        out.push(new Date(t))
        const next = core.floor(core.offset(t, n))
        if (!(next > t))
          break
        t = next
      }
      return out
    },
    count: (start: Date, end: Date) => core.count(floor(timeOf(start, 'start')), floor(timeOf(end, 'end'))),
    every(step: number): TimeInterval | null {
      const n = Math.floor(step)
      if (!Number.isFinite(n) || !(n > 0))
        return null
      if (n === 1)
        return toInterval(core)
      if (core.every)
        return toInterval(core.every(n))
      const field = core.field ?? ((time: number) => core.count(core.floor(0), time))
      return toInterval(filterCore(core, time => field(time) % n === 0))
    },
  })
}

/** 固定时长的间隔（秒、分、时）：取整时减掉更小单位的墙上字段，偏移按绝对毫秒。 */
function fixedCore(size: number, below: (time: number) => number, field: (time: number) => number): IntervalCore {
  return {
    floor: time => time - below(time),
    offset: (time, step) => time + step * size,
    count: (from, to) => Math.floor((to - from) / size),
    field,
  }
}

/** 基于日历构造一整套时间间隔。本地与 UTC 两套已经内建；其他时区传入按同一接口实现的日历。 */
export function createTimeIntervalSet(calendar: TimeCalendar): TimeIntervalSet {
  const wall = calendar.toWall
  const at = calendar.fromWall

  const millisecond: IntervalCore = {
    floor: time => time,
    offset: (time, step) => time + step,
    count: (from, to) => to - from,
    every: k => ({
      floor: time => Math.floor(time / k) * k,
      offset: (time, step) => time + step * k,
      count: (from, to) => Math.floor((to - from) / k),
    }),
  }
  const second = fixedCore(1000, time => wall(time).millisecond, time => wall(time).second)
  const minute = fixedCore(60_000, (time) => {
    const w = wall(time)
    return w.second * 1000 + w.millisecond
  }, time => wall(time).minute)
  const hour = fixedCore(3_600_000, (time) => {
    const w = wall(time)
    return w.minute * 60_000 + w.second * 1000 + w.millisecond
  }, time => wall(time).hour)

  const dayIndex = (time: number): number => {
    const w = wall(time)
    return dayNumber(w.year, w.month, w.day)
  }
  const shiftDays = (time: number, days: number): number => {
    const w = wall(time)
    return at(w.year, w.month, w.day + days, w.hour, w.minute, w.second, w.millisecond)
  }
  const day: IntervalCore = {
    floor(time) {
      const w = wall(time)
      return at(w.year, w.month, w.day)
    },
    offset: shiftDays,
    count: (from, to) => dayIndex(to) - dayIndex(from),
    field: time => wall(time).day - 1,
  }

  const weeks = new Map<number, TimeInterval>()
  const week = (firstDay: number): TimeInterval => {
    if (!Number.isInteger(firstDay) || firstDay < 0 || firstDay > 6)
      throw invalidArgument('周首日必须是 0–6 的整数（0 = 星期日）', { firstDay })
    let interval = weeks.get(firstDay)
    if (!interval) {
      interval = toInterval({
        floor(time) {
          const w = wall(time)
          return at(w.year, w.month, w.day - ((w.weekday - firstDay + 7) % 7))
        },
        offset: (time, step) => shiftDays(time, step * 7),
        count: (from, to) => Math.floor((dayIndex(to) - dayIndex(from)) / 7),
      })
      weeks.set(firstDay, interval)
    }
    return interval
  }

  const month: IntervalCore = {
    floor(time) {
      const w = wall(time)
      return at(w.year, w.month, 1)
    },
    offset(time, step) {
      const w = wall(time)
      return at(w.year, w.month + step, w.day, w.hour, w.minute, w.second, w.millisecond)
    },
    count(from, to) {
      const a = wall(from)
      const b = wall(to)
      return (b.year - a.year) * 12 + b.month - a.month
    },
    field: time => wall(time).month,
  }

  const yearCore = (k: number): IntervalCore => ({
    floor(time) {
      const w = wall(time)
      return at(Math.floor(w.year / k) * k, 0, 1)
    },
    offset(time, step) {
      const w = wall(time)
      return at(w.year + step * k, w.month, w.day, w.hour, w.minute, w.second, w.millisecond)
    },
    count: (from, to) => Math.floor((wall(to).year - wall(from).year) / k),
  })
  const year: IntervalCore = { ...yearCore(1), every: yearCore }

  return Object.freeze({
    millisecond: toInterval(millisecond),
    second: toInterval(second),
    minute: toInterval(minute),
    hour: toInterval(hour),
    day: toInterval(day),
    week,
    month: toInterval(month),
    year: toInterval(year),
  })
}

/** 运行环境所在时区的间隔。 */
export const localIntervals: TimeIntervalSet = /* @__PURE__ */ createTimeIntervalSet(localCalendar)

/** UTC 间隔。 */
export const utcIntervals: TimeIntervalSet = /* @__PURE__ */ createTimeIntervalSet(utcCalendar)
