/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 对齐吸附与参考线：把移动中的矩形的左 / 中 / 右（上 / 中 / 下）三条线与目标矩形的同类线比对，
// 在阈值内取最近的一条吸过去，再给出吸附后重合的参考线；没有可吸的目标时可退到网格。
// 带旋转角的矩形（移动的与目标都是）按旋转后的包围盒比对。

import type { Point, Rect } from './geometry'
import { rotatedBounds } from './geometry'

/** 参考线：axis 为 x 时是 x = position 的竖线，从 y = from 画到 y = to；为 y 时是横线。 */
export interface SnapGuide {
  readonly axis: 'x' | 'y'
  readonly position: number
  readonly from: number
  readonly to: number
}

export interface SnapOptions {
  /** 参与比对的目标矩形（通常是没被选中的其它元素）。 */
  readonly targets: readonly Rect[]
  /** 吸附距离，与矩形同一坐标系；屏幕上的固定像素要先除以缩放倍数。 */
  readonly threshold: number
  /** 是否在横向吸附，缺省 true。 */
  readonly x?: boolean
  /** 是否在纵向吸附，缺省 true。 */
  readonly y?: boolean
  /** 网格间距：某一向没有吸到目标时，把矩形（旋转后的包围盒）左上角落到最近的网格线上；缺省不用网格。 */
  readonly grid?: number
}

export interface SnapResult {
  /** 矩形应再平移的量。 */
  readonly dx: number
  readonly dy: number
  /** 吸附后与目标重合的参考线，同一位置的合并成一条。 */
  readonly guides: readonly SnapGuide[]
}

const EPSILON = 1e-6

function lines(start: number, length: number): readonly number[] {
  return [start, start + length / 2, start + length]
}

/** 求移动中的矩形该吸附的位移与参考线。 */
export function snapRect(moving: Rect, options: SnapOptions): SnapResult {
  const { threshold, grid } = options
  const rect = rotatedBounds(moving)
  const targets = options.targets.map(rotatedBounds)
  if (!(threshold >= 0) || !Number.isFinite(threshold))
    throw new RangeError(`[designer-kit] snap threshold must be a non-negative finite number, got ${threshold}`)
  if (grid !== undefined && !(grid > 0 && Number.isFinite(grid)))
    throw new RangeError(`[designer-kit] snap grid must be a positive finite number, got ${grid}`)

  const solve = (axis: 'x' | 'y'): number => {
    const own = axis === 'x' ? lines(rect.x, rect.width) : lines(rect.y, rect.height)
    let best: number | undefined
    for (const target of targets) {
      const theirs = axis === 'x' ? lines(target.x, target.width) : lines(target.y, target.height)
      for (const mine of own) {
        for (const line of theirs) {
          const delta = line - mine
          if (Math.abs(delta) <= threshold && (best === undefined || Math.abs(delta) < Math.abs(best) - EPSILON))
            best = delta
        }
      }
    }
    if (best !== undefined)
      return best
    if (grid !== undefined) {
      const start = axis === 'x' ? rect.x : rect.y
      return Math.round(start / grid) * grid - start
    }
    return 0
  }

  const dx = options.x === false ? 0 : solve('x')
  const dy = options.y === false ? 0 : solve('y')
  const moved: Rect = { x: rect.x + dx, y: rect.y + dy, width: rect.width, height: rect.height }
  const guides: SnapGuide[] = []
  if (options.x !== false)
    guides.push(...guidesOn('x', moved, targets))
  if (options.y !== false)
    guides.push(...guidesOn('y', moved, targets))
  return { dx, dy, guides }
}

function guidesOn(axis: 'x' | 'y', moved: Rect, targets: readonly Rect[]): SnapGuide[] {
  const own = axis === 'x' ? lines(moved.x, moved.width) : lines(moved.y, moved.height)
  const span = (rect: Rect): [number, number] => (axis === 'x' ? [rect.y, rect.y + rect.height] : [rect.x, rect.x + rect.width])
  const found = new Map<number, { position: number, from: number, to: number }>()
  for (const target of targets) {
    const theirs = axis === 'x' ? lines(target.x, target.width) : lines(target.y, target.height)
    for (const mine of own) {
      if (!theirs.some(line => Math.abs(line - mine) <= EPSILON))
        continue
      const [a0, a1] = span(moved)
      const [b0, b1] = span(target)
      const key = Math.round(mine / EPSILON)
      const current = found.get(key)
      found.set(key, {
        position: mine,
        from: Math.min(a0, b0, current?.from ?? Infinity),
        to: Math.max(a1, b1, current?.to ?? -Infinity),
      })
    }
  }
  return [...found.values()]
    .sort((a, b) => a.position - b.position)
    .map(guide => ({ axis, ...guide }))
}

/** 把数值落到最近的网格线上。 */
export function snapToGrid(value: number, grid: number): number {
  if (!(grid > 0 && Number.isFinite(grid)))
    throw new RangeError(`[designer-kit] snap grid must be a positive finite number, got ${grid}`)
  return Math.round(value / grid) * grid
}

/** 把点落到最近的网格交点上。 */
export function snapPointToGrid(point: Point, grid: number): Point {
  return { x: snapToGrid(point.x, grid), y: snapToGrid(point.y, grid) }
}
