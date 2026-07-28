import type { PositionRect } from '@xihan-ui/core'
import type { TourSpotlightRect } from './tour.types'

/** 高亮框在目标四周留出的缺省空白（px）。 */
export const TOUR_DEFAULT_SPOTLIGHT_PADDING = 8

/**
 * 留白落地：负数会把框缩到目标里面（甚至反向），小数会让边缘发虚，NaN 直接毁掉整条 style。
 * 这个值来自作者的 props，进算术之前必须先收成非负数。
 */
function normalizePadding(padding: number | undefined): number {
  if (padding == null || !Number.isFinite(padding))
    return TOUR_DEFAULT_SPOTLIGHT_PADDING
  return Math.max(0, padding)
}

/**
 * 由目标矩形算出高亮框：四周各外扩一圈留白。
 *
 * 纯函数，输入是量好的矩形而不是元素——量 DOM 是效应的事，
 * 这样"框该多大"这条规则单独就能验，不必先造一棵活 DOM。
 */
export function tourSpotlightBox(rect: PositionRect, padding: number | undefined): TourSpotlightRect {
  const pad = normalizePadding(padding)
  return {
    x: rect.x - pad,
    y: rect.y - pad,
    // 目标尺寸恒非负，但矩形可能来自虚拟锚点或退化的布局，兜一下比信它强
    width: Math.max(0, rect.width) + pad * 2,
    height: Math.max(0, rect.height) + pad * 2,
  }
}

/**
 * 两个高亮框是否等价。cell 的 isEqual 用它：
 * 每次量都会产出一个新对象，默认的 Object.is 会把"量到同一个结果"判成变了，
 * 于是窗口每动一像素就推一轮无谓的重渲。
 */
export function sameTourSpotlight(a: TourSpotlightRect | null, b: TourSpotlightRect | null | undefined): boolean {
  if (a == null || b == null)
    return a == null && b == null
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
