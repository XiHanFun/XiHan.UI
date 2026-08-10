import type { Disposable, Scope } from '@xihan-ui/kernel'

export interface ViewportEntryOptions {
  scope: Scope
  /** 被观察的哨兵节点。 */
  target: () => HTMLElement | null
  /** 裁剪出可视区的容器，返回 null 即以窗口视口为准。 */
  container?: () => HTMLElement | null
  /** 提前量（px）：可视区沿块轴向外扩这么多，哨兵还没真正露头就算已经进入。 */
  distance?: number
  /** 哨兵进入可视区时回调。 */
  onEnter: () => void
}

/**
 * 观察哨兵节点有没有进入可视区。
 *
 * 无 DOM 环境（宿主没有 IntersectionObserver）或哨兵还没渲染出来时返回 null，
 * 调用方按"这一轮没在观察"处理，不抛错。
 */
export function createViewportEntry(o: ViewportEntryOptions): Disposable | null {
  const Observer = o.scope.getWin().IntersectionObserver
  const target = o.target()
  if (typeof Observer !== 'function' || !target)
    return null

  const distance = Math.max(0, o.distance ?? 0)
  let disposed = false

  const observer = new Observer(
    (entries) => {
      if (disposed)
        return
      // 只认"进入"这一边：离开可视区不是一次新的触发
      if (entries.some(entry => entry.isIntersecting))
        o.onEnter()
    },
    {
      root: o.container?.() ?? null,
      // 只沿块轴放宽：内联轴一并放宽会把横向错开、其实看不见的哨兵也算进来
      rootMargin: `${distance}px 0px ${distance}px 0px`,
    },
  )
  observer.observe(target)

  return {
    dispose() {
      if (disposed)
        return
      disposed = true
      observer.disconnect()
    },
  }
}
