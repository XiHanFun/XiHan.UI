/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 跨列表插入：别的列表里的一项被拖进来时，算它会插在第几位、这边各项怎么让位、它落进来的那一格在哪。
// 与排序投影同一套判据——比的是拖入项的中心越过了谁的中心——只是被拖项不在这个列表里，没有「原位」可言。
import type { DndDelta, DndDirection, DndRect, InsertionLayoutInput, InsertionProjectionInput } from './types'

const ZERO: DndDelta = { x: 0, y: 0 }

/** 排布方向：两项以上时看首尾两项的先后，rtl 不必额外传参；不足两项时取兜底。 */
function directionOf(rects: readonly DndRect[], axis: 'horizontal' | 'vertical', fallback: DndDirection): DndDirection {
  const first = rects[0]
  const last = rects[rects.length - 1]
  if (!first || !last || first === last)
    return fallback
  const sign = Math.sign(center(last, axis) - center(first, axis))
  return sign === 0 ? fallback : (sign as DndDirection)
}

function center(rect: DndRect, axis: 'horizontal' | 'vertical'): number {
  return axis === 'horizontal' ? rect.x + rect.width / 2 : rect.y + rect.height / 2
}

/**
 * 拖入项此刻松手会插在第几位：沿排布方向数，中心排在拖入项中心之前的有几项就插在第几位。
 * 返回 0 到项数；列表为空时恒为 0。
 */
export function projectInsertion(input: InsertionProjectionInput): number {
  const { rects, point, axis } = input
  const dir = directionOf(rects, axis, input.direction ?? 1)
  const at = axis === 'horizontal' ? point.x : point.y
  let index = 0
  while (index < rects.length) {
    const rect = rects[index]
    if (!rect || (at - center(rect, axis)) * dir <= 0)
      break
    index++
  }
  return index
}

/**
 * 插入时各项的让位：插入点及其后的项沿排布方向挪出一格（拖入项的尺寸加一个间距），之前的不动。
 * 下标与 `rects` 对齐；插入点越界时一项都不动。
 */
export function insertionOffsets(input: InsertionLayoutInput): DndDelta[] {
  const { rects, index, axis, size, gap } = input
  if (!Number.isInteger(index) || index < 0 || index > rects.length)
    return rects.map(() => ZERO)
  const dir = directionOf(rects, axis, input.direction ?? 1)
  const shift: DndDelta = axis === 'horizontal'
    ? { x: dir * (size.width + gap), y: 0 }
    : { x: 0, y: size.height + gap }
  return rects.map((_, i) => (i >= index ? shift : ZERO))
}

/**
 * 拖入项落进来的那一格的左上角，视口坐标：插在某一项之前就占那一项此刻的起点，排到末尾就接在末项之后
 * 隔一个间距，列表为空时落在内容盒的起点上。水平反向排布时起点在右侧，左上角按拖入项的宽度往回退。
 */
export function insertionSlot(input: InsertionLayoutInput): DndDelta {
  const { rects, axis, size, gap, box } = input
  const dir = directionOf(rects, axis, input.direction ?? 1)
  const index = Math.min(Math.max(Math.trunc(input.index), 0), rects.length)
  const before = rects[index]
  const last = rects[rects.length - 1]

  if (axis === 'vertical') {
    if (before)
      return { x: before.x, y: before.y }
    if (last)
      return { x: last.x, y: last.y + last.height + gap }
    return { x: box.x, y: box.y }
  }

  if (before)
    return { x: dir > 0 ? before.x : before.x + before.width - size.width, y: before.y }
  if (last)
    return { x: dir > 0 ? last.x + last.width + gap : last.x - gap - size.width, y: last.y }
  return { x: dir > 0 ? box.x : box.x + box.width - size.width, y: box.y }
}
