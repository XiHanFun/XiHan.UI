/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多选元素的对齐与等距分布：输入一组矩形，按原顺序返回各自新的左上角；带旋转角的矩形按旋转后的包围盒排。

import type { Point, Rect } from './geometry'
import { rotatedBounds, unionRects } from './geometry'

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
    const box = rotatedBounds(rect)
    const moveTo = (x: number, y: number): Point => ({ x: rect.x + x - box.x, y: rect.y + y - box.y })
    switch (mode) {
      case 'left':
        return moveTo(bounds.x, box.y)
      case 'right':
        return moveTo(bounds.x + bounds.width - box.width, box.y)
      case 'top':
        return moveTo(box.x, bounds.y)
      case 'bottom':
        return moveTo(box.x, bounds.y + bounds.height - box.height)
      case 'center-vertical':
        return moveTo(bounds.x + (bounds.width - box.width) / 2, box.y)
      case 'center-horizontal':
        return moveTo(box.x, bounds.y + (bounds.height - box.height) / 2)
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
    .map((original, index) => {
      const rect = rotatedBounds(original)
      return { rect, index, center: start(rect) + length(rect) / 2 }
    })
    .sort((a, b) => a.center - b.center || a.index - b.index)
  const first = order[0]!
  const last = order[order.length - 1]!
  const place = (index: number, value: number): void => {
    const original = rects[index]!
    const box = rotatedBounds(original)
    result[index] = horizontal
      ? { x: original.x + value - box.x, y: original.y }
      : { x: original.x, y: original.y + value - box.y }
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
