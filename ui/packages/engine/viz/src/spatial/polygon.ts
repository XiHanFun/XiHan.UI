/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 平面几何判定：点在扇区内、点在多边形内、多边形面积与形心。

import type { Point } from '../geometry'
import type { ArcParams } from '../shape/arc'

const TAU = 2 * Math.PI

/** 点是否落在扇区或环段内（圆心在原点；角度 0 在 12 点方向、顺时针为正；间隙不计）。 */
export function pointInArc(px: number, py: number, params: ArcParams): boolean {
  const r = Math.hypot(px, py)
  const low = Math.min(params.innerRadius, params.outerRadius)
  const high = Math.max(params.innerRadius, params.outerRadius)
  if (r < low || r > high)
    return false
  const sweep = params.endAngle - params.startAngle
  if (Math.abs(sweep) >= TAU)
    return true
  // 屏幕坐标下 (sin θ, −cos θ) 是角度 θ 的方向
  const angle = Math.atan2(px, -py)
  const from = sweep >= 0 ? params.startAngle : params.endAngle
  const offset = (((angle - from) % TAU) + TAU) % TAU
  return offset <= Math.abs(sweep)
}

/** 点是否在多边形内（奇偶规则，射线法）。 */
export function pointInPolygon(px: number, py: number, polygon: readonly Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i] as Point
    const [xj, yj] = polygon[j] as Point
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      inside = !inside
  }
  return inside
}

/** 多边形的带符号面积：屏幕坐标（y 向下）下顶点顺时针为正。 */
export function polygonArea(polygon: readonly Point[]): number {
  let total = 0
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i] as Point
    const [xj, yj] = polygon[j] as Point
    total += xj * yi - xi * yj
  }
  return total / 2
}

/** 多边形的形心；面积为 0 时取顶点的平均。 */
export function polygonCentroid(polygon: readonly Point[]): Point {
  const area = polygonArea(polygon)
  if (Math.abs(area) < 1e-12) {
    const n = Math.max(1, polygon.length)
    return [polygon.reduce((s, p) => s + p[0], 0) / n, polygon.reduce((s, p) => s + p[1], 0) / n]
  }
  let cx = 0
  let cy = 0
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i] as Point
    const [xj, yj] = polygon[j] as Point
    const cross = xj * yi - xi * yj
    cx += (xj + xi) * cross
    cy += (yj + yi) * cross
  }
  return [cx / (6 * area), cy / (6 * area)]
}
