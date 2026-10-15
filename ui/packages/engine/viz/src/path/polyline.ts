/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 折线的度量与端点处理：总长、按长度比例取点、两端收回，以及连线终点的箭头三角形。

import type { PathSegment } from './index'
import { invalidArgument } from '../errors'

/** 折线上的点。 */
export interface PolylinePoint {
  readonly x: number
  readonly y: number
}

export interface ShortenOptions {
  /** 起点沿折线收回的长度，缺省 0。 */
  readonly start?: number
  /** 终点沿折线收回的长度，缺省 0。 */
  readonly end?: number
}

export interface ArrowHeadOptions {
  /** 箭头长度：尖端到底边的距离。 */
  readonly length: number
  /** 底边宽度，缺省长度的 0.8 倍。 */
  readonly width?: number
}

function checkPoints(points: readonly PolylinePoint[]): void {
  points.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y))
      throw invalidArgument('折线的点必须是有限数', { index, point })
  })
}

function nonNegative(name: string, value: number): number {
  if (!(Number.isFinite(value) && value >= 0))
    throw invalidArgument(`${name} 必须是非负有限数`, { [name]: value })
  return value
}

/** 折线总长；少于两个点时为 0。 */
export function polylineLength(points: readonly PolylinePoint[]): number {
  checkPoints(points)
  let total = 0
  for (let i = 1; i < points.length; i++)
    total += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y)
  return total
}

/** 折线上按总长比例 fraction（0–1）取的点：0 为起点，1 为终点，0.5 为总长一半处。折线总长为 0 时返回起点。 */
export function polylinePointAt(points: readonly PolylinePoint[], fraction: number): PolylinePoint {
  if (points.length === 0)
    throw invalidArgument('折线至少要有一个点', { points })
  if (!(Number.isFinite(fraction) && fraction >= 0 && fraction <= 1))
    throw invalidArgument('比例必须在 0 到 1 之间', { fraction })
  return pointAtDistance(points, polylineLength(points) * fraction)
}

/**
 * 两端沿折线各收回一段，返回新折线：收回的长度跨过的点一并去掉，端点落在剩下那一段上。
 * 两端收回之和不小于总长时，返回停在两端按收回长度分配的同一位置上的两点。
 */
export function shortenPolyline(points: readonly PolylinePoint[], options: ShortenOptions): PolylinePoint[] {
  const start = nonNegative('start', options.start ?? 0)
  const end = nonNegative('end', options.end ?? 0)
  const total = polylineLength(points)
  if (points.length < 2)
    return points.map(point => ({ x: point.x, y: point.y }))
  if (start + end >= total) {
    const meet = start + end === 0 ? 0 : total * start / (start + end)
    const point = pointAtDistance(points, meet)
    return [point, { x: point.x, y: point.y }]
  }
  let out = points.map(point => ({ x: point.x, y: point.y }))
  if (end > 0)
    out = trimTail(out, end)
  if (start > 0)
    out = trimTail(out.reverse(), start).reverse()
  return out
}

/** 箭头三角形：尖端在 tip，沿 from → tip 的方向，返回闭合的三点折线（尖端、底边两角）。from 与 tip 重合时三点都落在尖端。 */
export function arrowHead(from: PolylinePoint, tip: PolylinePoint, options: ArrowHeadOptions): PathSegment {
  checkPoints([from, tip])
  const length = nonNegative('length', options.length)
  const half = options.width === undefined ? length * 0.4 : nonNegative('width', options.width) / 2
  const dx = tip.x - from.x
  const dy = tip.y - from.y
  const d = Math.hypot(dx, dy) || 1
  const ux = dx / d
  const uy = dy / d
  const bx = tip.x - ux * length
  const by = tip.y - uy * length
  return { points: [{ x: tip.x, y: tip.y }, { x: bx - uy * half, y: by + ux * half }, { x: bx + uy * half, y: by - ux * half }], closed: true }
}

/** 自起点量 distance 处的点；超出总长时取终点。 */
function pointAtDistance(points: readonly PolylinePoint[], distance: number): PolylinePoint {
  let remaining = distance
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    if (length > 0 && remaining <= length) {
      const t = remaining / length
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    remaining -= length
  }
  const last = points[points.length - 1]!
  return { x: last.x, y: last.y }
}

/** 从末端收回 amount（小于总长）：跨过的点去掉，末点沿所在段往回移。 */
function trimTail(points: PolylinePoint[], amount: number): PolylinePoint[] {
  let remaining = amount
  const out = points.slice()
  while (out.length >= 2) {
    const tip = out[out.length - 1]!
    const prev = out[out.length - 2]!
    const dx = tip.x - prev.x
    const dy = tip.y - prev.y
    const d = Math.hypot(dx, dy)
    if (remaining < d) {
      out[out.length - 1] = { x: tip.x - (dx / d) * remaining, y: tip.y - (dy / d) * remaining }
      return out
    }
    remaining -= d
    out.pop()
  }
  return out
}
