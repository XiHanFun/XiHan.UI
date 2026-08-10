import type { Scope } from '@xihan-ui/kernel'

/** 一次量测：滚动量与可视区尺寸，单位 px。 */
export interface ScrollMetrics {
  /** 块轴滚动量。 */
  readonly top: number
  /** 内联轴滚动量。 */
  readonly left: number
  /** 可视区的块轴尺寸。 */
  readonly viewport: number
  /** 可滚动内容的块轴总长。 */
  readonly content: number
}

/** 可视区在窗口视口中的位置与大小，单位 px；与 getBoundingClientRect 同口径的物理量。 */
export interface ScrollViewportRect {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly height: number
}

/** 还没量到任何东西时的零值。 */
export const EMPTY_SCROLL_METRICS: ScrollMetrics = { top: 0, left: 0, viewport: 0, content: 0 }

/** 整页滚动时代表可视区的那个元素。走 scrollingElement 而非写死 documentElement：怪异模式下滚的是 body。 */
function pageScroller(scope: Scope): Element {
  const doc = scope.getDoc()
  return doc.scrollingElement ?? doc.documentElement
}

/** 两次量测是否一样。每次量测都产出新对象，判等只能逐字段比。 */
export function sameScrollMetrics(a: ScrollMetrics, b: ScrollMetrics | undefined): boolean {
  return !!b && a.top === b.top && a.left === b.left && a.viewport === b.viewport && a.content === b.content
}

/** 量滚动量与可视区尺寸；container 为 null 即量整页。 */
export function readScrollMetrics(container: HTMLElement | null, scope: Scope): ScrollMetrics {
  const el = container ?? pageScroller(scope)
  return {
    top: el.scrollTop,
    left: el.scrollLeft,
    viewport: el.clientHeight,
    content: el.scrollHeight,
  }
}

/**
 * 量可视区在窗口视口中的矩形；container 为 null 即窗口视口本身。
 * 整页那一路的尺寸取 scrollingElement 的 client 尺寸而非 innerWidth/innerHeight：
 * 后者把滚动条那条也算进来，而 fixed 定位的参照系不含它。
 */
export function readViewportRect(container: HTMLElement | null, scope: Scope): ScrollViewportRect {
  if (container) {
    const rect = container.getBoundingClientRect()
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
  }
  const el = pageScroller(scope)
  return { top: 0, left: 0, width: el.clientWidth, height: el.clientHeight }
}

/** 滚动事件的派发目标：容器滚动派在容器上，整页滚动派在窗口上。 */
export function scrollEventTarget(container: HTMLElement | null, scope: Scope): EventTarget {
  return container ?? scope.getWin()
}

/** 把可视区沿块轴滚到某个位置；container 为 null 即滚整页。 */
export function scrollBlockTo(
  container: HTMLElement | null,
  scope: Scope,
  top: number,
  behavior: ScrollBehavior,
): void {
  if (container) {
    // 优先用原生 scrollTo，无该方法时直接写 scrollTop
    if (typeof container.scrollTo === 'function')
      container.scrollTo({ top, behavior })
    else
      container.scrollTop = top
    return
  }
  const win = scope.getWin()
  if (typeof win.scrollTo === 'function')
    win.scrollTo({ top, behavior })
}
