/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮动按钮的位置几何：贴边位置与像素位置的换算、松手后贴向哪条边，全是纯函数。

import type {
  FloatButtonEdge,
  FloatButtonEdgePosition,
  FloatButtonPlacement,
  FloatButtonPoint,
  FloatButtonPosition,
  FloatButtonSnap,
} from './float-button.types'
import { projectRelease } from '@xihan-ui/motion'

/** 不给 snap 时贴左右两边里近的那条。 */
export const FLOAT_BUTTON_DEFAULT_SNAP: FloatButtonSnap = 'inline'

/** 松手落点的投影时间（秒）：甩一下就贴到甩去的那一边，慢慢放下则按放下的地方算。 */
const PROJECTION_SECONDS = 0.15

/** 是不是贴边位置。 */
export function isFloatButtonEdgePosition(position: FloatButtonPosition): position is FloatButtonEdgePosition {
  return 'edge' in position
}

/** 比例夹到 0 到 1；不是有限数的按 0 算。 */
export function normalizeFloatButtonRatio(ratio: number): number {
  return Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0
}

/** 两个位置是否相同：坐标每次都是新对象，默认的 Object.is 会把没动判成动了。 */
export function sameFloatButtonPosition(a: FloatButtonPosition | null | undefined, b: FloatButtonPosition | null | undefined): boolean {
  if (a === b)
    return true
  if (!a || !b)
    return false
  if (isFloatButtonEdgePosition(a))
    return isFloatButtonEdgePosition(b) && a.edge === b.edge && a.ratio === b.ratio
  return !isFloatButtonEdgePosition(b) && a.x === b.x && a.y === b.y
}

/**
 * 位置决定贴哪个角来排：离触发器最近的恒是视口的那条边，展开组朝页面中间长。
 * 停在一点时按它在视口上半还是下半定朝向；视口高度未知（服务端渲染）时朝下长。
 */
export function floatButtonPlacementOf(position: FloatButtonPosition, viewportHeight: number | null): FloatButtonPlacement {
  if (!isFloatButtonEdgePosition(position))
    return viewportHeight != null && position.y * 2 >= viewportHeight ? 'bottom-start' : 'top-start'
  const { edge, ratio } = position
  const lower = normalizeFloatButtonRatio(ratio) >= 0.5
  switch (edge) {
    case 'inline-start':
      return lower ? 'bottom-start' : 'top-start'
    case 'inline-end':
      return lower ? 'bottom-end' : 'top-end'
    case 'block-start':
      return lower ? 'top-end' : 'top-start'
    case 'block-end':
      return lower ? 'bottom-end' : 'bottom-start'
  }
}

export interface FloatButtonSnapInput {
  /** 松手时触发器左上角。 */
  at: FloatButtonPoint
  /** 松手速度（像素 / 秒）。 */
  velocity: FloatButtonPoint
  /** 触发器边长。 */
  size: number
  /** 视口宽高，不含滚动条。 */
  width: number
  height: number
  /** 离视口四边至少留出的距离。 */
  gap: number
  rtl: boolean
  snap: FloatButtonSnap
}

export interface FloatButtonSnapResult {
  /** 落定处的触发器左上角。 */
  target: FloatButtonPoint
  /** 落定后要提交的位置。 */
  position: FloatButtonPosition
}

function clamp(value: number, min: number, max: number): number {
  // 视口比触发器加两侧间距还窄时下界说了算：贴着起始那一侧
  return Math.max(min, Math.min(value, max))
}

type Side = 'left' | 'right' | 'top' | 'bottom'

function sideOf(snap: Exclude<FloatButtonSnap, 'none'>, cx: number, cy: number, width: number, height: number): Side {
  if (snap === 'inline')
    return cx * 2 < width ? 'left' : 'right'
  if (snap === 'block')
    return cy * 2 < height ? 'top' : 'bottom'
  // 四条边里最近的那条；等距时先左右、后上下
  const candidates: Array<[Side, number]> = [['left', cx], ['right', width - cx], ['top', cy], ['bottom', height - cy]]
  let best = candidates[0]!
  for (const candidate of candidates) {
    if (candidate[1] < best[1])
      best = candidate
  }
  return best[0]
}

/**
 * 松手后落到哪里：先把松手处收进视口（四边各留 gap），再按 snap 贴边。
 * 贴哪条边看顺着松手速度投影出去的那一点，所以甩一下就贴到甩去的那一边；沿边的那条轴停在放手的地方。
 * 贴边时提交贴边位置（比例按视口量，视口尺寸变了照样成立），不贴时提交像素坐标。
 */
export function resolveFloatButtonSnap(input: FloatButtonSnapInput): FloatButtonSnapResult {
  const { at, velocity, size, width, height, gap, rtl, snap } = input
  const minX = gap
  const maxX = width - size - gap
  const minY = gap
  const maxY = height - size - gap
  const x = clamp(at.x, minX, maxX)
  const y = clamp(at.y, minY, maxY)
  if (snap === 'none')
    return { target: { x, y }, position: { x, y } }

  const cx = projectRelease(at.x, velocity.x, PROJECTION_SECONDS) + size / 2
  const cy = projectRelease(at.y, velocity.y, PROJECTION_SECONDS) + size / 2
  const side = sideOf(snap, cx, cy, width, height)
  if (side === 'left' || side === 'right') {
    const target = { x: side === 'left' ? minX : clamp(maxX, minX, maxX), y }
    const edge: FloatButtonEdge = (side === 'left') !== rtl ? 'inline-start' : 'inline-end'
    return { target, position: { edge, ratio: height > 0 ? (y + size / 2) / height : 0 } }
  }
  const target = { x, y: side === 'top' ? minY : clamp(maxY, minY, maxY) }
  const along = width > 0 ? (x + size / 2) / width : 0
  const edge: FloatButtonEdge = side === 'top' ? 'block-start' : 'block-end'
  return { target, position: { edge, ratio: rtl ? 1 - along : along } }
}
