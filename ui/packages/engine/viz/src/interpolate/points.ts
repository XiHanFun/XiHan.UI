/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按数据键对齐的点序列插值：折线与面积的过渡插值点，再重新生成路径，而不是插值路径字符串。

import type { Interpolator } from './value'
import { VizError } from '../errors'

export interface KeyedPoint {
  readonly key: string
  readonly x: number
  readonly y: number
  /** 面积的基线；缺省时视作与 y 重合。 */
  readonly y0?: number
  /** false 表示该键的值缺失，折线在此断开；缺省 true。 */
  readonly defined?: boolean
}

interface Track {
  readonly key: string
  readonly start: KeyedPoint | null
  readonly end: KeyedPoint | null
}

function indexByKey(points: readonly KeyedPoint[], side: 'from' | 'to'): Map<string, KeyedPoint> {
  const index = new Map<string, KeyedPoint>()
  points.forEach((point, i) => {
    if (index.has(point.key))
      throw new VizError('XH_VIZ_DUPLICATE_KEY', '点序列里有重复的键', { side, key: point.key, index: i })
    index.set(point.key, point)
  })
  return index
}

/**
 * 两个点序列之间的插值。两边都有的键从旧位置移到新位置；
 * 新增的键从相邻旧点的位置出现，删除的键并入相邻新点后消失（t = 1 时与邻点重合，由调用方移除）。
 * 输出顺序：新序列的顺序，删除的键插在它原来的前驱之后。
 */
export function interpolatePoints(from: readonly KeyedPoint[], to: readonly KeyedPoint[]): Interpolator<KeyedPoint[]> {
  const fromIndex = indexByKey(from, 'from')
  const toIndex = indexByKey(to, 'to')

  const tracks: Track[] = []
  const placed = new Set<string>()
  let i = 0
  let j = 0
  while (i < from.length || j < to.length) {
    while (i < from.length && placed.has((from[i] as KeyedPoint).key))
      i++
    const old = from[i]
    if (old && !toIndex.has(old.key)) {
      tracks.push({ key: old.key, start: old, end: null })
      placed.add(old.key)
      i++
      continue
    }
    const next = to[j]
    if (next) {
      tracks.push({ key: next.key, start: fromIndex.get(next.key) ?? null, end: next })
      placed.add(next.key)
      j++
      continue
    }
    i++
  }

  /** 离第 k 条轨迹最近、且在 side 这一侧有位置的邻居：先找前驱，没有再找后继。 */
  const neighbour = (k: number, side: 'start' | 'end'): KeyedPoint | null => {
    for (let n = k - 1; n >= 0; n--) {
      const point = (tracks[n] as Track)[side]
      if (point)
        return point
    }
    for (let n = k + 1; n < tracks.length; n++) {
      const point = (tracks[n] as Track)[side]
      if (point)
        return point
    }
    return null
  }

  const resolved = tracks.map((track, k) => {
    const own = (track.end ?? track.start) as KeyedPoint
    const start = track.start ?? neighbour(k, 'start') ?? own
    const end = track.end ?? neighbour(k, 'end') ?? own
    const hasBaseline = start.y0 !== undefined || end.y0 !== undefined
    return {
      key: track.key,
      start,
      end,
      hasBaseline,
      defined: track.start && track.end
        ? track.start.defined !== false && track.end.defined !== false
        : own.defined !== false,
    }
  })

  return t => resolved.map(({ key, start, end, hasBaseline, defined }) => {
    const point: { key: string, x: number, y: number, y0?: number, defined: boolean } = {
      key,
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
      defined,
    }
    if (hasBaseline) {
      const b0 = start.y0 ?? start.y
      const b1 = end.y0 ?? end.y
      point.y0 = b0 + (b1 - b0) * t
    }
    return point
  })
}
