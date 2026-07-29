import type { Disposable, RuntimeConfig } from '@xihan-ui/core'

/** 距底多少 px 起算「在底」的默认阈值。 */
export const STICK_TO_BOTTOM_THRESHOLD = 64

export interface StickToBottomState {
  /** 当前滚动位置是否落在底部阈值内。 */
  readonly atBottom: boolean
  /** 内容增长时是否自动跟到底，用户上滚后为 false。 */
  readonly sticking: boolean
}

export interface StickToBottomOptions {
  config: RuntimeConfig
  /** 惰性返回滚动容器。 */
  scrollEl: () => HTMLElement | null
  /** 惰性返回内容容器，作为尺寸变化的观察目标。 */
  contentEl: () => HTMLElement | null
  /** 距底多少 px 视为在底，默认 64。 */
  threshold?: number
  /** 状态值变化时回调。 */
  onChange?: (state: StickToBottomState) => void
}

export interface StickToBottomHandle extends Disposable {
  readonly state: () => StickToBottomState
  /** 滚到底部并恢复粘附，默认 'smooth'，reducedMotion 为真时强制 'instant'。 */
  scrollToBottom: (behavior?: 'smooth' | 'instant') => void
  /** 重新读取 scrollEl / contentEl，节点变了就解绑重绑。 */
  retarget: () => void
}

/** 锚点，不粘附时用于把可视区钉在同一段内容上。 */
interface Anchor {
  el: HTMLElement
  delta: number
}

/** 跟随内容增长把滚动容器保持在底部，用户上滚则解除粘附；增高补偿在 ResizeObserver 回调里同步写 scrollTop。 */
export function createStickToBottom(o: StickToBottomOptions): StickToBottomHandle {
  const threshold = o.threshold ?? STICK_TO_BOTTOM_THRESHOLD
  const win = o.config.scope.getWin()

  // 初值不读几何，真实状态由第一次 scroll / ResizeObserver 回调补上
  let atBottom = true
  let sticking = true
  let disposed = false
  // 补偿窗口开启期间的 scroll 不改动粘附意图
  let sizeAdjusting = false
  let sizeToken = 0
  let lastScrollTop = 0
  let anchor: Anchor | null = null
  let observer: ResizeObserver | null = null
  // 当前已绑定监听与观察的两个节点，retarget 据此判断是否重绑
  let el: HTMLElement | null = null
  let observedContent: HTMLElement | null = null

  function computeAtBottom(): boolean {
    if (!el)
      return true
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
  }

  function apply(nextAtBottom: boolean, nextSticking: boolean): void {
    if (nextAtBottom === atBottom && nextSticking === sticking)
      return
    atBottom = nextAtBottom
    sticking = nextSticking
    // 同步通知，不做节流
    o.onChange?.({ atBottom, sticking })
  }

  function unstick(): void {
    if (disposed)
      return
    apply(atBottom, false)
  }

  /** 在 contentEl 的直接子节点里线性取最后一个可见且 offsetTop <= scrollTop 的节点作为锚点。 */
  function pickAnchor(scrollTop: number): void {
    const children = o.contentEl()?.children
    if (!children || children.length === 0) {
      anchor = null
      return
    }
    let found: HTMLElement | null = null
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement | undefined
      if (!child)
        continue
      // offsetParent 为 null 表示节点不在布局中，跳过
      if (child.offsetParent === null)
        continue
      if (child.offsetTop <= scrollTop)
        found = child
    }
    anchor = found ? { el: found, delta: scrollTop - found.offsetTop } : null
  }

  function openSizeWindow(): void {
    sizeAdjusting = true
    const token = ++sizeToken
    const close = (): void => {
      // 只有最后一次开窗才能关窗
      if (token === sizeToken)
        sizeAdjusting = false
    }
    if (typeof win.requestAnimationFrame === 'function')
      win.requestAnimationFrame(close)
    else
      win.setTimeout(close, 0)
  }

  function onScroll(): void {
    if (disposed || !el)
      return
    const top = el.scrollTop
    const nextAtBottom = computeAtBottom()
    if (sizeAdjusting) {
      // 补偿窗口内只更新 atBottom 与锚点，不改粘附意图
      apply(nextAtBottom, sticking)
      lastScrollTop = top
      pickAnchor(top)
      return
    }
    // scrollTop 变小即视为用户上滚，解除粘附
    const scrolledUp = top < lastScrollTop
    // 由不在底重新滚回阈值内时恢复粘附
    const nextSticking = scrolledUp ? false : (nextAtBottom && !atBottom ? true : sticking)
    apply(nextAtBottom, nextSticking)
    lastScrollTop = top
    pickAnchor(top)
  }

  // 已滚到顶时继续上滚不产生 scroll 事件，由 wheel / touchmove / keydown 兜住
  function onWheel(e: WheelEvent): void {
    if (e.deltaY < 0)
      unstick()
  }

  function onTouchMove(): void {
    if (disposed || !el)
      return
    const top = el.scrollTop
    if (top < lastScrollTop)
      unstick()
    lastScrollTop = top
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home')
      unstick()
  }

  function onResize(): void {
    if (disposed || !el)
      return
    openSizeWindow()
    if (sticking) {
      el.scrollTop = el.scrollHeight - el.clientHeight
    }
    else if (anchor?.el.isConnected && anchor.el.offsetParent !== null) {
      // 把可视区钉回锚元素；锚已失联或转为隐藏时不做补偿，等下一次 scroll 重选
      el.scrollTop = anchor.el.offsetTop + anchor.delta
    }
    apply(computeAtBottom(), sticking)
    lastScrollTop = el.scrollTop
  }

  function scrollToBottom(behavior: 'smooth' | 'instant' = 'smooth'): void {
    if (disposed)
      return
    const mode = o.config.reducedMotion() ? 'instant' : behavior
    if (el) {
      // 优先用原生 scrollTo，无该方法时直接写 scrollTop
      if (typeof el.scrollTo === 'function')
        el.scrollTo({ top: el.scrollHeight, behavior: mode })
      else
        el.scrollTop = el.scrollHeight - el.clientHeight
    }
    // 立即置粘附，不等滚动动画结束
    apply(computeAtBottom(), true)
  }

  function detachListeners(): void {
    el?.removeEventListener('scroll', onScroll)
    el?.removeEventListener('wheel', onWheel)
    el?.removeEventListener('touchmove', onTouchMove)
    el?.removeEventListener('keydown', onKeyDown)
    observer?.disconnect()
    observer = null
    el = null
    observedContent = null
    // 锚点指向旧内容，一并清掉
    anchor = null
  }

  function attach(): void {
    el = o.scrollEl()
    observedContent = o.contentEl()
    if (!el)
      return
    lastScrollTop = el.scrollTop
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('keydown', onKeyDown)

    // 没有 ResizeObserver 时降级为只跟随滚动
    const Observer = win.ResizeObserver
    if (typeof Observer === 'function') {
      observer = new Observer(onResize)
      observer.observe(el)
      if (observedContent)
        observer.observe(observedContent)
    }
  }

  function retarget(): void {
    if (disposed)
      return
    if (o.scrollEl() === el && o.contentEl() === observedContent)
      return
    detachListeners()
    attach()
  }

  attach()

  return {
    state: () => ({ atBottom, sticking }),
    scrollToBottom,
    retarget,
    dispose() {
      if (disposed)
        return
      disposed = true
      detachListeners()
    },
  }
}
