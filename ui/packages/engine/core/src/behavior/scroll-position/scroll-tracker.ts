import type { Disposable, Scope } from '../../kernel'
import type { ScrollMetrics } from './scroll-source'
import { EMPTY_SCROLL_METRICS, readScrollMetrics, sameScrollMetrics, scrollEventTarget } from './scroll-source'

export interface ScrollTrackerOptions {
  scope: Scope
  /** 滚动容器，返回 null 即观察整页滚动。挂上监听时读一次。 */
  container: () => HTMLElement | null
  /** 量到的值与上一次不同时回调。 */
  onChange?: (metrics: ScrollMetrics) => void
}

export interface ScrollTrackerHandle extends Disposable {
  /** 最近一次量到的滚动量与可视区尺寸。 */
  metrics: () => ScrollMetrics
}

/**
 * 观察一个滚动容器（或整页）的滚动位置，量到的值与上一次不同就报出来。
 * 滚动本身不接管：只挂 passive 监听，不拦事件、不改滚动量。
 *
 * 建好之后不主动回调一次：初值是零值，无布局环境里量出来也是零值，两者相等就不会有第一次回调。
 * 要"挂上就先结算一帧"的调用方，自己在建完之后结算一次。
 */
export function createScrollTracker(o: ScrollTrackerOptions): ScrollTrackerHandle {
  const win = o.scope.getWin()
  const container = o.container()
  const target = scrollEventTarget(container, o.scope)
  let metrics = EMPTY_SCROLL_METRICS
  let disposed = false

  function measure(): void {
    if (disposed)
      return
    const next = readScrollMetrics(container, o.scope)
    if (sameScrollMetrics(next, metrics))
      return
    metrics = next
    o.onChange?.(metrics)
  }

  const onScroll = (): void => measure()
  // 窗口尺寸一变可视区尺寸跟着变，量出来的值要跟上
  const onResize = (): void => measure()

  target.addEventListener('scroll', onScroll, { passive: true })
  win.addEventListener('resize', onResize)
  measure()

  return {
    metrics: () => metrics,
    dispose() {
      if (disposed)
        return
      disposed = true
      target.removeEventListener('scroll', onScroll)
      win.removeEventListener('resize', onResize)
    },
  }
}
