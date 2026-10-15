/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 平面几何的基本类型与矩形运算。

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

/** 轴对齐矩形，(x, y) 为左上角。 */
export interface Rect extends Point, Size {}

/** 以两点为对角的矩形，与两点的先后无关。 */
export function rectFromPoints(a: Point, b: Point): Rect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

/** 包住全部矩形的最小矩形；空列表返回 undefined。 */
export function unionRects(rects: readonly Rect[]): Rect | undefined {
  if (rects.length === 0)
    return undefined
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const rect of rects) {
    x0 = Math.min(x0, rect.x)
    y0 = Math.min(y0, rect.y)
    x1 = Math.max(x1, rect.x + rect.width)
    y1 = Math.max(y1, rect.y + rect.height)
  }
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

/** outer 是否完整包住 inner（边界重合算包住）。 */
export function rectContains(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height
}

/** 两个矩形是否相交（边界相接算相交）。 */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height
}

/** 四边各向外扩 amount（负数向内收，宽高不小于 0）。 */
export function expandRect(rect: Rect, amount: number): Rect {
  const width = Math.max(0, rect.width + amount * 2)
  const height = Math.max(0, rect.height + amount * 2)
  return { x: rect.x + (rect.width - width) / 2, y: rect.y + (rect.height - height) / 2, width, height }
}

/** 矩形中心。 */
export function rectCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}
