/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 悬停意图的几何判据：指针从触发器斜穿到浮层的路上会短暂离开两者，
// 用「出发点 + 浮层近侧两角」围出的安全三角判定它是不是在赶路，是就不收浮层。

export interface HoverPoint {
  x: number
  y: number
}

export interface HoverRect {
  x: number
  y: number
  width: number
  height: number
}

// 坐标是浮点像素：离边不到这么远就算在边上
const EDGE_EPSILON = 1e-6

/** 点在线段上（含两端）：离线段所在直线不到容差，且落在两端点围成的范围里。 */
function onSegment(point: HoverPoint, a: HoverPoint, b: HoverPoint): boolean {
  const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)
  if (Math.abs(cross) > EDGE_EPSILON * Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1))
    return false
  return point.x >= Math.min(a.x, b.x) - EDGE_EPSILON && point.x <= Math.max(a.x, b.x) + EDGE_EPSILON
    && point.y >= Math.min(a.y, b.y) - EDGE_EPSILON && point.y <= Math.max(a.y, b.y) + EDGE_EPSILON
}

/** 点在多边形内（射线法）；落在任一条边或顶点上都算在内。 */
export function pointInPolygon(point: HoverPoint, polygon: readonly HoverPoint[]): boolean {
  if (polygon.length < 3)
    return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!
    const b = polygon[j]!
    // 恰在边上或顶点上：按在内处理。安全三角的顶点就是离开点，离开后紧接着的那次移动常常落在这里
    if (onSegment(point, a, b))
      return true
    // 边的竖直范围盖住该点，且交点在该点右侧，穿一次翻一次
    const intersects = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    if (intersects)
      inside = !inside
  }
  return inside
}

/**
 * 出发点到目标矩形的安全三角：取目标离出发点最近的那条边的两个角，
 * 沿边的方向各向外扩 buffer（px），给斜穿的手抖留余量。
 * 目标压着出发点（点已在矩形内）时退化为整个矩形外扩 buffer。
 */
export function safeTriangle(origin: HoverPoint, target: HoverRect, buffer = 6): HoverPoint[] {
  const left = target.x
  const right = target.x + target.width
  const top = target.y
  const bottom = target.y + target.height

  const insideX = origin.x >= left && origin.x <= right
  const insideY = origin.y >= top && origin.y <= bottom
  if (insideX && insideY) {
    return [
      { x: left - buffer, y: top - buffer },
      { x: right + buffer, y: top - buffer },
      { x: right + buffer, y: bottom + buffer },
      { x: left - buffer, y: bottom + buffer },
    ]
  }

  // 近侧边按出发点相对矩形的方位取：水平方向出发取左/右边，垂直方向出发取上/下边。
  // 斜角方位按更远的那个轴取边，三角形张口更大、更宽容
  const dxLeft = left - origin.x
  const dxRight = origin.x - right
  const dyTop = top - origin.y
  const dyBottom = origin.y - bottom
  const dx = Math.max(dxLeft, dxRight)
  const dy = Math.max(dyTop, dyBottom)

  if (dx >= dy) {
    const x = dxLeft > dxRight ? left : right
    return [
      origin,
      { x, y: top - buffer },
      { x, y: bottom + buffer },
    ]
  }
  const y = dyTop > dyBottom ? top : bottom
  return [
    origin,
    { x: left - buffer, y },
    { x: right + buffer, y },
  ]
}
