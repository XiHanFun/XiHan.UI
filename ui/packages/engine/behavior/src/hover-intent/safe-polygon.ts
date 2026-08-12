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

/** 点在多边形内（射线法）；落在边上算在内。 */
export function pointInPolygon(point: HoverPoint, polygon: readonly HoverPoint[]): boolean {
  if (polygon.length < 3)
    return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!
    const b = polygon[j]!
    // 边的水平范围盖住该点，且交点在该点右侧，穿一次翻一次
    const intersects = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    if (intersects)
      inside = !inside
    // 恰在顶点或水平边上：按在内处理，避免贴边抖动
    if (a.y === point.y && b.y === point.y
      && point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x)) {
      return true
    }
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
