/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 等距时间轴（交易时段）的刻度：点按下标等距排开、没有数据的时段（休市、周末）不占宽度，
// 刻度仍落在整点、整天、月初这些时间边界上——取每个边界之后的第一个点。
// 从细到粗试时间间隔，取刻度数不超过预算的最细一档；时段里断开的地方让实际刻度比按时长估的少，所以按实数判。

import type { TimeInterval, TimeIntervalName, TimeIntervalSet } from '../time/interval'
import { invalidArgument } from '../errors'
import { TIME_TICK_CANDIDATES } from '../time/ticks'
import { bisectLeft } from './bisect'

const YEAR = 365 * 24 * 60 * 60 * 1000

/** 候选表之外按年跨的步数：数据跨几十年时仍有合适的一档。 */
const YEAR_STEPS = [2, 5, 10, 20, 50, 100]

/** 候选的边界数超过预算的这么多倍就不去逐个找了：太细，一定超。 */
const ENUMERATE_LIMIT = 64

export interface OrdinalTicks {
  /** 刻度所在的下标（整列里的下标，升序）。 */
  readonly positions: readonly number[]
  /** 刻度所在的时间粒度：标签据此决定显示到哪一级。 */
  readonly name: TimeIntervalName
}

export interface OrdinalTickOptions {
  /** 周刻度从星期几开始，0 = 星期日；缺省 1（星期一）。 */
  readonly firstDayOfWeek?: number
}

/** [from, to) 里跨过 interval 边界之后的第一个点；超过 limit 个就停（返回的长度 > limit 即表示太多）。 */
function crossings(times: ArrayLike<number>, from: number, to: number, interval: TimeInterval, limit: number): number[] {
  const out: number[] = []
  const last = times[to - 1] as number
  let boundary = interval.ceil(new Date(times[from] as number))
  let previous = -1
  while (+boundary <= last) {
    const at = bisectLeft(times, +boundary, from, to)
    if (at >= to)
      break
    if (at !== previous) {
      out.push(at)
      previous = at
      if (out.length > limit)
        return out
      // 下一个边界从这个点的时间起找：中间整段没有数据（休市）时一步跳过去
      const next = interval.ceil(new Date((times[at] as number) + 1))
      boundary = +next > +boundary ? next : interval.offset(boundary, 1)
      continue
    }
    boundary = interval.offset(boundary, 1)
  }
  return out
}

/**
 * 等距时间轴的刻度。times 是升序的时间值（毫秒），只看 [from, to)；约 count 个。
 * 区间里一个边界都不跨时（全在同一个粒度里）落一个刻度在 from 上。
 */
export function ordinalTimeTicks(
  times: ArrayLike<number>,
  from: number,
  to: number,
  count: number,
  set: TimeIntervalSet,
  options: OrdinalTickOptions = {},
): OrdinalTicks {
  if (!(count >= 1))
    throw invalidArgument('刻度数量至少为 1', { count })
  const a = Math.max(0, Math.floor(from))
  const b = Math.min(times.length, Math.ceil(to))
  if (a >= b)
    return { positions: [], name: 'day' }
  const span = (times[b - 1] as number) - (times[a] as number)
  const candidates: (readonly [TimeIntervalName, number, number])[] = [
    ...TIME_TICK_CANDIDATES,
    ...YEAR_STEPS.map(step => ['year', step, step * YEAR] as const),
  ]
  const budget = Math.floor(count)
  for (const [name, step, nominal] of candidates) {
    if (span / nominal > budget * ENUMERATE_LIMIT)
      continue
    const base = name === 'week' ? set.week(options.firstDayOfWeek ?? 1) : set[name]
    const interval = base.every(step)
    if (!interval)
      continue
    const found = crossings(times, a, b, interval, budget)
    if (found.length <= budget && found.length > 0)
      return { positions: found, name }
    if (found.length === 0)
      return { positions: [a], name }
  }
  return { positions: [a], name: 'year' }
}
