/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 纹理：颜色不可用或不可靠的场合（强制色、打印、作者在祖先上写 data-xh-chart-patterns），柱、面积与扇区
// 换成纹理填充，读者靠纹理区分系列。8 种纹理与色槽一一对应：45° 与 135° 两个方向各有稀、中、密三档，
// 另有斜向与正向两种交叉。纹理定义在绘图区的 <defs> 里，一直都在；用不用由样式决定，几何由这里给出。

import type { Tone } from '@xihan-ui/core'

/** 纹理的种数，与分类色槽一样多。 */
export const CHART_PATTERN_COUNT = 8

/** defs 里的一种纹理。 */
export interface ChartPattern {
  /** 纹理序号 1–8：分类系列等于色槽，语义系列按声明次序。 */
  readonly index: number
  /** <pattern> 的 id：由绘图区的 id 派生，服务端与客户端一致。 */
  readonly id: string
  /** 纹理的线取所属系列的颜色：色槽与语气二者有一。 */
  readonly slot: number | null
  readonly tone: Tone | null
  /** 一格纹理的边长（px）：线与线的间距。 */
  readonly size: number
  /** 格子旋转的角度：0（正向交叉）、45 或 135。 */
  readonly angle: number
  /** 一格里的线。 */
  readonly path: string
}

/** 纹理要画成什么样：方向、疏密、是否交叉。间距按数据点的直径换算，随密度一起缩放。 */
const SHAPES: readonly { angle: number, spacing: number, cross: boolean }[] = [
  { angle: 45, spacing: 1, cross: false },
  { angle: 135, spacing: 1, cross: false },
  { angle: 45, spacing: 0.75, cross: false },
  { angle: 135, spacing: 0.75, cross: false },
  { angle: 45, spacing: 0.5, cross: false },
  { angle: 135, spacing: 0.5, cross: false },
  { angle: 45, spacing: 1, cross: true },
  { angle: 0, spacing: 1, cross: true },
]

/** 纹理序号对应的 <pattern> id。 */
export function chartPatternId(plotId: string, index: number): string {
  return `${plotId}-pattern-${index}`
}

/** 引用一种纹理的填充值：写进标记的样式变量，皮肤在纹理模式下拿它当 fill。 */
export function chartPatternFill(plotId: string, index: number): string {
  return `url(#${chartPatternId(plotId, index)})`
}

/**
 * 一组系列要用的纹理：同一个序号只定义一次。线画在格子正中，边缘不会被格子裁掉半条；
 * 格子按角度旋转，竖线转 45° 成「/」，转 135° 成「\」。
 */
export function chartPatterns(
  plotId: string,
  owners: readonly { readonly pattern: number | null, readonly slot: number | null, readonly tone: Tone | null }[],
  pointSize: number,
): ChartPattern[] {
  const patterns = new Map<number, ChartPattern>()
  for (const owner of owners) {
    const index = owner.pattern
    if (index == null || patterns.has(index))
      continue
    const shape = SHAPES[index - 1]!
    const size = Math.max(2, Math.round(pointSize * shape.spacing))
    const mid = size / 2
    const path = shape.cross ? `M${mid},0V${size}M0,${mid}H${size}` : `M${mid},0V${size}`
    patterns.set(index, { index, id: chartPatternId(plotId, index), slot: owner.slot, tone: owner.tone, size, angle: shape.angle, path })
  }
  return [...patterns.values()].sort((a, b) => a.index - b.index)
}
