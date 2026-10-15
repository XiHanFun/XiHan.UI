/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多选元素的对齐与等距分布：输入一组矩形，按原顺序返回各自新的左上角。

import type { Point, Rect } from './geometry'
import { unionRects } from './geometry'

/**
 * 对齐方式：left / right / top / bottom 贴齐选区包围盒的对应边；
 * center-vertical 把各自的中心落到包围盒的竖直中线上，center-horizontal 落到水平中线上。
 */
export type AlignMode = 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'

/** 分布方向。 */
export type DistributeAxis = 'horizontal' | 'vertical'

/** 分布口径：gap 让相邻元素之间的空隙相等，center 让相邻中心的间距相等。 */
export type DistributeSpacing = 'gap' | 'center'

/** 按选区包围盒对齐；不到两个矩形时原样返回各自的位置。 */
export function alignRects(rects: readonly Rect[], mode: AlignMode): Point[] {
  const bounds = unionRects(rects)
  if (!bounds || rects.length < 2)
    return rects.map(rect => ({ x: rect.x, y: rect.y }))
  return rects.map((rect) => {
    switch (mode) {
      case 'left':
        return { x: bounds.x, y: rect.y }
      case 'right':
        return { x: bounds.x + bounds.width - rect.width, y: rect.y }
      case 'top':
        return { x: rect.x, y: bounds.y }
      case 'bottom':
        return { x: rect.x, y: bounds.y + bounds.height - rect.height }
      case 'center-vertical':
        return { x: bounds.x + (bounds.width - rect.width) / 2, y: rect.y }
      case 'center-horizontal':
        return { x: rect.x, y: bounds.y + (bounds.height - rect.height) / 2 }
      default:
        throw new RangeError(`[designer-kit] unknown align mode "${String(mode)}"`)
    }
  })
}

/**
 * 沿一个方向等距分布：按中心排序，首尾两个不动，中间的重新排开；不到三个矩形时原样返回。
 * gap 口径下中间元素总宽超过首尾之间的空间时，空隙为负，元素会重叠。
 */
export function distributeRects(rects: readonly Rect[], axis: DistributeAxis, spacing: DistributeSpacing = 'gap'): Point[] {
  const result = rects.map(rect => ({ x: rect.x, y: rect.y }))
  if (rects.length < 3)
    return result
  const horizontal = axis === 'horizontal'
  if (!horizontal && axis !== 'vertical')
    throw new RangeError(`[designer-kit] unknown distribute axis "${String(axis)}"`)
  const start = (rect: Rect): number => (horizontal ? rect.x : rect.y)
  const length = (rect: Rect): number => (horizontal ? rect.width : rect.height)
  const order = rects
    .map((rect, index) => ({ rect, index, center: start(rect) + length(rect) / 2 }))
    .sort((a, b) => a.center - b.center || a.index - b.index)
  const first = order[0]!
  const last = order[order.length - 1]!
  const place = (index: number, value: number): void => {
    result[index] = horizontal ? { x: value, y: rects[index]!.y } : { x: rects[index]!.x, y: value }
  }
  if (spacing === 'center') {
    const step = (last.center - first.center) / (order.length - 1)
    order.slice(1, -1).forEach((item, i) => place(item.index, first.center + step * (i + 1) - length(item.rect) / 2))
    return result
  }
  if (spacing !== 'gap')
    throw new RangeError(`[designer-kit] unknown distribute spacing "${String(spacing)}"`)
  const inner = order.slice(1, -1)
  const occupied = inner.reduce((sum, item) => sum + length(item.rect), 0)
  const span = start(last.rect) - (start(first.rect) + length(first.rect))
  const gap = (span - occupied) / (order.length - 1)
  let cursor = start(first.rect) + length(first.rect) + gap
  for (const item of inner) {
    place(item.index, cursor)
    cursor += length(item.rect) + gap
  }
  return result
}
