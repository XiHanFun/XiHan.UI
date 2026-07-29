import type { PositionRect } from '@xihan-ui/core'
import type { TourSpotlightRect } from './tour.types'

/** 高亮框在目标四周留出的缺省空白（px）。 */
export const TOUR_DEFAULT_SPOTLIGHT_PADDING = 8

/**
 * 留白落地：负数会把框缩到目标里面，小数会让边缘发虚，NaN 会毁掉整条 style，
 * 因此进算术前先收成非负整数。
 */
function normalizePadding(padding: number | undefined): number {
  if (padding == null || !Number.isFinite(padding))
    return TOUR_DEFAULT_SPOTLIGHT_PADDING
  return Math.max(0, padding)
}

/**
 * 由目标矩形算出高亮框：四周各外扩一圈留白。
 * 纯函数，输入是量好的矩形而不是元素，量 DOM 是效应的事。
 */
export function tourSpotlightBox(rect: PositionRect, padding: number | undefined): TourSpotlightRect {
  const pad = normalizePadding(padding)
  return {
    x: rect.x - pad,
    y: rect.y - pad,
    // 矩形可能来自虚拟锚点或退化的布局，兜一次非负
    width: Math.max(0, rect.width) + pad * 2,
    height: Math.max(0, rect.height) + pad * 2,
  }
}

/**
 * 两个高亮框是否等价，供 cell 的 isEqual 用：
 * 每次量都产出新对象，默认的 Object.is 会把量到同一个结果判成变了。
 */
export function sameTourSpotlight(a: TourSpotlightRect | null, b: TourSpotlightRect | null | undefined): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
