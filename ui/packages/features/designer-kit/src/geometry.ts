/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 平面几何的基本类型与矩形运算。矩形可带绕中心的旋转角，包含、相交、合并一律按旋转后的包围盒计算。

/** 平面上的点。 */
export interface Point {
  readonly x: number
  readonly y: number
}

/** 宽高。 */
export interface Size {
  readonly width: number
  readonly height: number
}

/** 矩形：(x, y, width, height) 是旋转前的框；rotation 为绕中心顺时针旋转的角度（度），缺省 0。 */
export interface Rect extends Point, Size {
  readonly rotation?: number
}

/** 以两点为对角的轴对齐矩形，与两点的先后无关。 */
export function rectFromPoints(a: Point, b: Point): Rect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

/** 包住全部矩形旋转后包围盒的最小轴对齐矩形；空列表返回 undefined。 */
export function unionRects(rects: readonly Rect[]): Rect | undefined {
  if (rects.length === 0)
    return undefined
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const rect of rects) {
    const box = rotatedBounds(rect)
    x0 = Math.min(x0, box.x)
    y0 = Math.min(y0, box.y)
    x1 = Math.max(x1, box.x + box.width)
    y1 = Math.max(y1, box.y + box.height)
  }
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

/** outer 的包围盒是否完整包住 inner 的包围盒（边界重合算包住）。 */
export function rectContains(outer: Rect, inner: Rect): boolean {
  const a = rotatedBounds(outer)
  const b = rotatedBounds(inner)
  return b.x >= a.x && b.y >= a.y && b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height
}

/** 两个矩形的包围盒是否相交（边界相接算相交）；要按旋转后的实际形状判断用 rotatedRectIntersects。 */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  const p = rotatedBounds(a)
  const q = rotatedBounds(b)
  return p.x <= q.x + q.width && q.x <= p.x + p.width && p.y <= q.y + q.height && q.y <= p.y + p.height
}

/** 四边各向外扩 amount（负数向内收，宽高不小于 0），中心与旋转角不变。 */
export function expandRect(rect: Rect, amount: number): Rect {
  const width = Math.max(0, rect.width + amount * 2)
  const height = Math.max(0, rect.height + amount * 2)
  return { ...rect, x: rect.x + (rect.width - width) / 2, y: rect.y + (rect.height - height) / 2, width, height }
}

/** 矩形中心（旋转不改变中心）。 */
export function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

/** 把点绕 center 顺时针旋转 degrees 度。 */
export function rotatePoint(point: Point, center: Point, degrees: number): Point {
  if (degrees === 0)
    return point
  const radians = degrees * Math.PI / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dx = point.x - center.x
  const dy = point.y - center.y
  return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos }
}

/** 旋转后的四角，按左上、右上、右下、左下（旋转前的位置）排列。 */
export function rectCorners(rect: Rect): [Point, Point, Point, Point] {
  const center = rectCenter(rect)
  const degrees = rect.rotation ?? 0
  const corners: [Point, Point, Point, Point] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ]
  return corners.map(corner => rotatePoint(corner, center, degrees)) as [Point, Point, Point, Point]
}

/** 旋转后的轴对齐包围盒；没有旋转时就是矩形本身的框。 */
export function rotatedBounds(rect: Rect): Rect {
  if (!rect.rotation)
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  const corners = rectCorners(rect)
  const xs = corners.map(corner => corner.x)
  const ys = corners.map(corner => corner.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

/** 点是否落在旋转后的矩形内，边界算在内；tolerance 让判定区四边外扩。 */
export function pointInRect(point: Point, rect: Rect, tolerance = 0): boolean {
  const local = rotatePoint(point, rectCenter(rect), -(rect.rotation ?? 0))
  return local.x >= rect.x - tolerance && local.x <= rect.x + rect.width + tolerance
    && local.y >= rect.y - tolerance && local.y <= rect.y + rect.height + tolerance
}

/** 命中测试：返回包含该点的最上层矩形下标（数组越靠后越在上），都不命中返回 -1。 */
export function hitTest(point: Point, rects: readonly Rect[], tolerance = 0): number {
  for (let index = rects.length - 1; index >= 0; index--) {
    if (pointInRect(point, rects[index]!, tolerance))
      return index
  }
  return -1
}

/** 两个矩形按旋转后的实际形状是否相交（边界相接算相交），按分离轴判断。 */
export function rotatedRectIntersects(a: Rect, b: Rect): boolean {
  if (!a.rotation && !b.rotation)
    return rectsIntersect(a, b)
  const first = rectCorners(a)
  const second = rectCorners(b)
  const axes = [...edgeAxes(a.rotation ?? 0), ...edgeAxes(b.rotation ?? 0)]
  const EPSILON = 1e-9
  for (const axis of axes) {
    const p = project(first, axis)
    const q = project(second, axis)
    if (p.max < q.min - EPSILON || q.max < p.min - EPSILON)
      return false
  }
  return true
}

function edgeAxes(degrees: number): Point[] {
  const radians = degrees * Math.PI / 180
  return [{ x: Math.cos(radians), y: Math.sin(radians) }, { x: -Math.sin(radians), y: Math.cos(radians) }]
}

function project(points: readonly Point[], axis: Point): { min: number, max: number } {
  let min = Infinity
  let max = -Infinity
  for (const point of points) {
    const value = point.x * axis.x + point.y * axis.y
    min = Math.min(min, value)
    max = Math.max(max, value)
  }
  return { min, max }
}
