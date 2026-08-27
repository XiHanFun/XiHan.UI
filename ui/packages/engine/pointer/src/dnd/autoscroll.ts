// 边缘自动滚动：拖到容器边上时把容器滚起来，让视口外的落点够得着。
import type { DndDelta, DndRect } from './types'

/** 距边缘多少像素内开始滚。 */
export const DEFAULT_EDGE_THRESHOLD = 48

/** 贴到边上时每帧滚多少像素。 */
export const DEFAULT_EDGE_SPEED = 12

export interface EdgeScrollInput {
  /** 容器在视口里的矩形。 */
  bounds: DndRect
  /** 指针在视口里的位置。 */
  point: { x: number, y: number }
  threshold?: number
  speed?: number
}

/**
 * 这一帧该滚多少。
 *
 * 速度随入侵深度线性上升：刚够到边缘线时几乎不动，贴死边缘时满速。
 * 用常速会让「想停在边缘附近看一眼」变得不可能——手一抖就冲过去半屏。
 *
 * 指针在容器外时按贴死边缘算，不是不滚：拖出容器再往回带是常见动作。
 */
export function edgeScrollDelta(input: EdgeScrollInput): DndDelta {
  const { bounds, point } = input
  const threshold = input.threshold ?? DEFAULT_EDGE_THRESHOLD
  const speed = input.speed ?? DEFAULT_EDGE_SPEED

  if (threshold <= 0 || speed <= 0)
    return { x: 0, y: 0 }

  return {
    x: axisDelta(point.x, bounds.x, bounds.x + bounds.width, threshold, speed),
    y: axisDelta(point.y, bounds.y, bounds.y + bounds.height, threshold, speed),
  }
}

/** 单轴：负值往起点滚，正值往终点滚，中间地带是 0。 */
function axisDelta(position: number, start: number, end: number, threshold: number, speed: number): number {
  // 容器比两条边缘带加起来还窄时不滚：两带重叠会让方向来回翻，表现是原地抽搐
  if (end - start <= threshold * 2)
    return 0

  const fromStart = position - start
  if (fromStart < threshold)
    return -ramp(threshold - fromStart, threshold, speed)

  const fromEnd = end - position
  if (fromEnd < threshold)
    return ramp(threshold - fromEnd, threshold, speed)

  return 0
}

/** 入侵深度 → 速度。深度夹在 [0, threshold]，越界的按满速算。 */
function ramp(depth: number, threshold: number, speed: number): number {
  const clamped = Math.min(Math.max(depth, 0), threshold)
  return (clamped / threshold) * speed
}
