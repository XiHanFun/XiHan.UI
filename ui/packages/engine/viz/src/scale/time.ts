/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间比例尺：日期按 epoch 毫秒线性映射；刻度、取整与标签走时间间隔与多尺度时间格式。

import type { TimeInterval, TimeIntervalName, TimeIntervalSet } from '../time/interval'
import type { TimeScale } from './types'
import { invalidArgument } from '../errors'
import { createTimeFormat } from '../format/time'
import { localIntervals, utcIntervals } from '../time/interval'
import { timeTickInterval, timeTicks } from '../time/ticks'
import { scaleLinear } from './continuous'

export interface TimeScaleOptions {
  /** 缺省 2000-01-01 到 2000-01-02（本地或 UTC）。 */
  readonly domain?: readonly Date[]
  readonly range?: readonly number[]
  readonly clamp?: boolean
  readonly round?: boolean
  /**
   * 刻度与取整所用的时间间隔；缺省 time 为本地间隔、utc 为 UTC 间隔。
   * 指定其他时区的间隔时，同时给出同一时区的 timeZone，刻度标签才按该时区显示。
   */
  readonly intervals?: TimeIntervalSet
  /** 刻度标签的时区（IANA 名）；缺省 time 为运行环境所在时区、utc 为 UTC。 */
  readonly timeZone?: string
  /** 周刻度从星期几开始，0 = 星期日；缺省 1。 */
  readonly firstDayOfWeek?: number
}

function timesOf(domain: readonly Date[]): number[] {
  return domain.map((date) => {
    const time = date instanceof Date ? +date : Number.NaN
    if (Number.isNaN(time))
      throw invalidArgument('时间比例尺的定义域必须是有效日期', { domain })
    return time
  })
}

function createTime(kind: 'time' | 'utc', options: TimeScaleOptions): TimeScale {
  const intervals = options.intervals ?? (kind === 'utc' ? utcIntervals : localIntervals)
  const timeZone = options.timeZone ?? (kind === 'utc' ? 'UTC' : undefined)
  const firstDayOfWeek = options.firstDayOfWeek ?? 1
  const defaultDomain = kind === 'utc'
    ? [new Date(Date.UTC(2000, 0, 1)), new Date(Date.UTC(2000, 0, 2))]
    : [new Date(2000, 0, 1), new Date(2000, 0, 2)]
  const domainDates = Object.freeze((options.domain ?? defaultDomain).map(d => new Date(+d)))
  const linear = scaleLinear({
    domain: timesOf(domainDates),
    range: options.range ?? [0, 1],
    clamp: options.clamp ?? false,
    round: options.round ?? false,
  })
  const start = domainDates[0] as Date
  const stop = domainDates[domainDates.length - 1] as Date

  const scale: TimeScale = {
    kind,
    domain: domainDates,
    range: linear.range,
    clamp: linear.clamp,
    map(value: Date): number | undefined {
      if (!(value instanceof Date) || Number.isNaN(+value))
        return undefined
      return linear.map(+value)
    },
    invert: pixel => new Date(linear.invert(pixel)),
    ticks(countOrInterval: number | TimeInterval = 10): Date[] {
      if (typeof countOrInterval === 'number')
        return timeTicks(start, stop, countOrInterval, intervals, { firstDayOfWeek })
      const reverse = +stop < +start
      const [low, high] = reverse ? [stop, start] : [start, stop]
      const out = countOrInterval.range(low, new Date(+high + 1))
      return reverse ? out.reverse() : out
    },
    tickFormat(locale: string, countOrName: number | TimeIntervalName = 10): (value: Date) => string {
      const format = createTimeFormat(locale, timeZone)
      const name = typeof countOrName === 'number'
        ? timeTickInterval(start, stop, countOrName, intervals, { firstDayOfWeek })?.name ?? 'millisecond'
        : countOrName
      return value => format.tick(value, name)
    },
    nice(countOrInterval: number | TimeInterval = 10): TimeScale {
      const reverse = +stop < +start
      const [low, high] = reverse ? [stop, start] : [start, stop]
      const interval = typeof countOrInterval === 'number'
        ? timeTickInterval(low, high, countOrInterval, intervals, { firstDayOfWeek })?.interval
        : countOrInterval
      if (!interval)
        return scale
      const niceLow = interval.floor(low)
      const niceHigh = interval.ceil(high)
      const inner = domainDates.slice(1, -1)
      return createTime(kind, { ...options, domain: reverse ? [niceHigh, ...inner, niceLow] : [niceLow, ...inner, niceHigh] })
    },
  }
  return Object.freeze(scale)
}

/** 本地时间比例尺。 */
export function scaleTime(options: TimeScaleOptions = {}): TimeScale {
  return createTime('time', options)
}

/** UTC 时间比例尺。 */
export function scaleUtc(options: TimeScaleOptions = {}): TimeScale {
  return createTime('utc', options)
}
