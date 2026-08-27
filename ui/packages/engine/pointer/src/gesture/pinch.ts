// 双指手势的几何：两个触点之间的距离、中点，以及相对起始那一刻的缩放与位移。
import type { DndDelta } from '../dnd/types'

export interface PinchPoint {
  clientX: number
  clientY: number
}

export interface PinchSnapshot {
  /** 两指间距（px）。 */
  distance: number
  /** 两指的中点。 */
  center: DndDelta
  /** 两指连线相对水平方向的角度（弧度）。 */
  angle: number
}

export interface PinchChange {
  /** 相对起始那一刻的缩放倍数。起始间距为 0 时恒为 1。 */
  scale: number
  /** 中点相对起始那一刻的位移。 */
  translate: DndDelta
  /** 连线转过的角度（弧度），逆时针为正。 */
  rotate: number
}

/** 拍下两指此刻的几何。 */
export function pinchSnapshot(a: PinchPoint, b: PinchPoint): PinchSnapshot {
  const dx = b.clientX - a.clientX
  const dy = b.clientY - a.clientY
  return {
    distance: Math.hypot(dx, dy),
    center: { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 },
    angle: Math.atan2(dy, dx),
  }
}

/**
 * 从起始那一刻到此刻变了多少。
 *
 * 缩放取两次间距之比。起始间距为 0（两指落在同一点）时算不出比例，恒返回 1——
 * 除以 0 会得到 Infinity，一路传下去会把图片的尺寸整个吃掉。
 *
 * 转角归一到 (-π, π]：两指转过半圈以上时，直接相减会得到一个接近 2π 的数，
 * 看起来像是猛地转回去了。
 */
export function pinchChange(start: PinchSnapshot, current: PinchSnapshot): PinchChange {
  return {
    scale: start.distance > 0 ? current.distance / start.distance : 1,
    translate: { x: current.center.x - start.center.x, y: current.center.y - start.center.y },
    rotate: normalizeAngle(current.angle - start.angle),
  }
}

/** 把角度收进 (-π, π]。 */
function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle))
    return 0
  const turn = Math.PI * 2
  let out = angle % turn
  if (out > Math.PI)
    out -= turn
  if (out <= -Math.PI)
    out += turn
  return out
}
