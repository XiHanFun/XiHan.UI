/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 框选几何：由拖拽起止点得出选框，再按「完整包住」或「碰到即选」挑出落在框里的矩形，矩形可带旋转角。

import type { Point, Rect } from './geometry'
import { rectContains, rectFromPoints, rotatedRectIntersects } from './geometry'

/** contain：矩形旋转后的包围盒整个落在框内才选中；intersect：旋转后的形状与框相交即选中。 */
export type MarqueeMode = 'contain' | 'intersect'

/** 拖拽起点与当前点围成的选框。 */
export function marqueeRect(start: Point, current: Point): Rect {
  return rectFromPoints(start, current)
}

/** 落在选框里的矩形下标，按输入顺序排列。 */
export function selectInMarquee(marquee: Rect, rects: readonly Rect[], mode: MarqueeMode = 'contain'): number[] {
  if (mode !== 'contain' && mode !== 'intersect')
    throw new RangeError(`[designer-kit] unknown marquee mode "${String(mode)}"`)
  const out: number[] = []
  rects.forEach((rect, index) => {
    const hit = mode === 'contain' ? rectContains(marquee, rect) : rotatedRectIntersects(rect, marquee)
    if (hit)
      out.push(index)
  })
  return out
}

/** 按拖拽方向决定框选方式：自左向右拖为完整包住，自右向左拖为碰到即选。 */
export function marqueeModeFromDrag(start: Point, current: Point): MarqueeMode {
  return current.x >= start.x ? 'contain' : 'intersect'
}
