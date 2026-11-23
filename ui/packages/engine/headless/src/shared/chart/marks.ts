/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 场景里的标记换成 SVG 属性时各图表共用的两步：取路径数据、把色阶位置换成分段渐变的落点。

import type { Mark, ShapeMark } from '@xihan-ui/viz'
import { markPath } from '@xihan-ui/viz'

/** 标记的路径数据：路径标记直接取 d，其余几何（矩形、弧、圆、连线）交给 viz 换成路径。 */
export function chartMarkPath(mark: Mark): string {
  if (mark.kind === 'path')
    return mark.d
  return markPath(mark as ShapeMark)
}

/** 色阶位置 0–1 换成段号与段内百分比：低段在起点与中点之间，高段在中点与终点之间。 */
export function chartSequentialStop(t: number): { seg: 'low' | 'high', p: string } {
  return t <= 0.5 ? { seg: 'low', p: `${(t * 200).toFixed(1)}%` } : { seg: 'high', p: `${((t - 0.5) * 200).toFixed(1)}%` }
}
