/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提示框落点：画在根里，锚点从绘图区坐标换成相对根的坐标，按锚点所在的半边决定朝哪边长。

import type { ChartOffset } from './machine-base'
import type { ChartSize } from './types'

export interface ChartTipPlacement {
  /** 锚点相对根内边距盒的坐标（px）。 */
  readonly x: number
  readonly y: number
  /**
   * 提示框长在锚点的哪一侧：锚点在绘图区右半边时长在左侧（start），否则长在右侧（end）。
   * 绘图区不随 RTL 镜像，这里的左右也是物理方向。
   */
  readonly side: 'start' | 'end'
  /** 锚点在上半边时向下长（below），否则向上长（above）。 */
  readonly block: 'above' | 'below'
}

export function placeChartTooltip(anchor: { readonly x: number, readonly y: number }, size: ChartSize, offset: ChartOffset): ChartTipPlacement {
  return {
    x: offset.x + anchor.x,
    y: offset.y + anchor.y,
    side: anchor.x > size.width / 2 ? 'start' : 'end',
    block: anchor.y > size.height / 2 ? 'above' : 'below',
  }
}

/** 每个图表实例上一回露面的提示框：内容与落点。 */
const shownTooltips = new WeakMap<object, { tooltip: unknown, tip: unknown }>()

/**
 * 提示框隐去时留着上一回露面的内容与落点：退场淡出途中不先变空、不跳回绘图区原点。
 * 露不露仍按当下有没有内容算，由调用方写进 data-state；owner 取图表的 service，每个实例各记各的
 */
export function retainChartTooltip<M, P>(owner: object, tooltip: M | null, tip: P | null): { tooltip: M | null, tip: P | null } {
  if (tooltip != null) {
    if (tip != null)
      shownTooltips.set(owner, { tooltip, tip })
    return { tooltip, tip }
  }
  const last = shownTooltips.get(owner) as { tooltip: M, tip: P } | undefined
  return last ?? { tooltip: null, tip: null }
}
