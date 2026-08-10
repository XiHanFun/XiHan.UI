import { getWindow, scrollableAncestors, viewportEdges } from './dom'

/**
 * 跟随更新：锚点或浮层一动就重算。
 * 触发源在一帧内合并成一次计算——滚动事件在同一帧的绘制之前就派完了，
 * 合并到 rAF 里既不掉帧也不多算。
 */
export function observePosition(
  anchor: Element | null,
  floating: HTMLElement,
  update: () => void,
): () => void {
  const win = getWindow(floating)
  let disposed = false
  let frame: number | null = null
  let moveObserver: IntersectionObserver | null = null

  const disarmMove = (): void => {
    moveObserver?.disconnect()
    moveObserver = null
  }

  /** 重挂次数上限。校准不收敛时宁可放弃移动检测，也不能挂了又挂没完没了。 */
  const MAX_ARM_ATTEMPTS = 5
  let armAttempts = 0

  function sameSpot(a: DOMRect, b: DOMRect): boolean {
    return Math.abs(a.top - b.top) < 1 && Math.abs(a.left - b.left) < 1
      && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1
  }

  /**
   * 锚点没改尺寸、只是被别处的布局挤走时的检测。
   * 拿 IntersectionObserver 把锚点此刻的位置圈成根区域，它一挪交叉比就不再是圈定时的那个值。
   *
   * 阈值不能想当然写 1：根区域的四条边取整后与锚点差着亚像素，首帧交叉比往往是 0.99x，
   * 那样从 0.99x 掉到 0 一次都不跨过 1，回调永远不来。首帧对不上就拿实测比例重挂一次。
   * 锚点没整个落在视口里时不挂：那时根区域会退化，交叉比恒对不上。
   */
  function armMove(threshold = 1): void {
    disarmMove()
    if (disposed || !anchor || typeof win.IntersectionObserver !== 'function')
      return
    if (armAttempts >= MAX_ARM_ATTEMPTS)
      return

    const rect = anchor.getBoundingClientRect()
    const view = viewportEdges(win)
    if (rect.width <= 0 || rect.height <= 0)
      return
    if (rect.top < view.top || rect.left < view.left || rect.right > view.right || rect.bottom > view.bottom)
      return

    const rootMargin = [
      -Math.floor(rect.top),
      -Math.floor(view.right - rect.right),
      -Math.floor(view.bottom - rect.bottom),
      -Math.floor(rect.left),
    ].map(value => `${value}px`).join(' ')

    let initial = true
    moveObserver = new win.IntersectionObserver((entries) => {
      const ratio = entries[entries.length - 1]?.intersectionRatio ?? 0
      if (ratio !== threshold) {
        if (!initial) {
          armAttempts = 0
          schedule()
          return
        }
        // 首帧就对不上：拿实测比例重挂来校准。完全不相交说明刚挂上就被挪走了，交给下一轮
        armAttempts += 1
        if (ratio > 0)
          armMove(ratio)
        else
          schedule()
        return
      }
      // 阈值对上了，但锚点可能在挂的这一拍里就已经动了
      if (initial && !sameSpot(rect, anchor.getBoundingClientRect())) {
        schedule()
        return
      }
      initial = false
      armAttempts = 0
    }, {
      // root 必须显式给当前文档：留空时交叉区域取的是顶层文档的视口，
      // 组件跑在 iframe 里就会与自己的坐标对不上，交叉比恒为 0
      root: anchor.ownerDocument,
      rootMargin,
      threshold: Math.max(0, Math.min(1, threshold)),
    })
    moveObserver.observe(anchor)
  }

  function schedule(): void {
    if (disposed || frame != null)
      return
    frame = win.requestAnimationFrame(() => {
      frame = null
      if (disposed)
        return
      update()
      armMove()
    })
  }

  const scrollTargets = new Set<HTMLElement>([
    ...scrollableAncestors(anchor),
    ...scrollableAncestors(floating),
  ])
  for (const target of scrollTargets)
    target.addEventListener('scroll', schedule, { passive: true })
  win.addEventListener('scroll', schedule, { passive: true })
  win.addEventListener('resize', schedule, { passive: true })

  const resizeObserver = typeof win.ResizeObserver === 'function'
    ? new win.ResizeObserver(() => schedule())
    : null
  if (anchor)
    resizeObserver?.observe(anchor)
  resizeObserver?.observe(floating)

  armMove()

  return () => {
    disposed = true
    if (frame != null)
      win.cancelAnimationFrame(frame)
    frame = null
    for (const target of scrollTargets)
      target.removeEventListener('scroll', schedule)
    win.removeEventListener('scroll', schedule)
    win.removeEventListener('resize', schedule)
    resizeObserver?.disconnect()
    disarmMove()
  }
}
