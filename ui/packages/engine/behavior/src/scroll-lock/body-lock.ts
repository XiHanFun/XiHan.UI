import type { Disposable, RuntimeConfig } from '@xihan-ui/kernel'
import { createPerDocumentRegistry, isHTMLElement } from '@xihan-ui/kernel'

export interface ScrollLockOptions {
  config: RuntimeConfig
}

export type ScrollLockHandle = Disposable

/** 加锁期间把让出来的滚动条宽度写在文档根上，供 fixed 定位的元素让位。 */
const GUTTER_VAR = '--xh-scroll-lock-gutter'

/** 探测滚动根时往下走的层数与看过的节点数上限。 */
const PROBE_DEPTH = 6
const PROBE_NODES = 64

/** 候选滚动根在两个轴上至少要铺到视口的这个比例。 */
const PROBE_COVERAGE = 0.5

interface LockState {
  count: number
  /** 当前锁住的元素，未加锁时为 null。 */
  el: HTMLElement | null
  /** 是否走整页那一路（body 变 fixed）。 */
  page: boolean
  savedScrollY: number
  savedScrollTop: number
  saved: {
    position: string
    top: string
    width: string
    overflow: string
    boxSizing: string
    paddingInlineEnd: string
  }
  onViewportChange: (() => void) | null
}

const registry = createPerDocumentRegistry<LockState>(() => ({
  count: 0,
  el: null,
  page: true,
  savedScrollY: 0,
  savedScrollTop: 0,
  saved: { position: '', top: '', width: '', overflow: '', boxSizing: '', paddingInlineEnd: '' },
  onViewportChange: null,
}))

/** 元素代表的是整页滚动。 */
function isPageRoot(el: Element, doc: Document): boolean {
  return el === doc.body || el === doc.documentElement || el === doc.scrollingElement
}

/** 元素沿块轴自己能滚：overflow 允许滚，且内容确实溢出。 */
function isBlockScrollable(el: Element, win: Window): boolean {
  const overflowY = win.getComputedStyle(el).overflowY
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay')
    return false
  return el.scrollHeight > el.clientHeight
}

/**
 * 从 body 逐层往下找滚动根，取最外层「块轴可滚且两个轴都铺满半个视口以上」的元素。
 * 铺满这条判据把侧栏、局部列表这类能滚但不是根的容器挡在外面。
 */
function probeScrollRoot(doc: Document, win: Window): HTMLElement | null {
  const minWidth = win.innerWidth * PROBE_COVERAGE
  const minHeight = win.innerHeight * PROBE_COVERAGE
  let level: Element[] = doc.body ? Array.from(doc.body.children) : []
  let seen = 0

  for (let depth = 0; depth < PROBE_DEPTH && level.length > 0; depth += 1) {
    const next: Element[] = []
    for (const el of level) {
      if (seen >= PROBE_NODES)
        return null
      seen += 1
      if (isHTMLElement(el) && el.clientWidth >= minWidth && el.clientHeight >= minHeight && isBlockScrollable(el, win))
        return el
      next.push(...el.children)
    }
    level = next
  }
  return null
}

/** 解析加锁目标：注入的滚动根优先，其次整页，再次探测，都没有就回落 body。 */
function resolveTarget(doc: Document, win: Window, config: RuntimeConfig): { el: HTMLElement, page: boolean } {
  const injected = config.scrollRoot?.() ?? null
  if (injected)
    return isPageRoot(injected, doc) ? { el: doc.body, page: true } : { el: injected, page: false }

  const root = doc.scrollingElement ?? doc.documentElement
  if (root.scrollHeight > root.clientHeight)
    return { el: doc.body, page: true }

  const probed = probeScrollRoot(doc, win)
  return probed ? { el: probed, page: false } : { el: doc.body, page: true }
}

/** 量加锁后会消失的那条滚动条有多宽；加锁后它已经没了，只能在加锁前调用。 */
function measureGutter(el: HTMLElement, page: boolean, doc: Document, win: Window): number {
  if (page) {
    const root = doc.scrollingElement ?? doc.documentElement
    if (root.scrollHeight <= root.clientHeight)
      return 0
    return Math.max(0, win.innerWidth - doc.documentElement.clientWidth)
  }
  if (el.scrollHeight <= el.clientHeight)
    return 0
  const style = win.getComputedStyle(el)
  const border = (Number.parseFloat(style.borderLeftWidth) || 0) + (Number.parseFloat(style.borderRightWidth) || 0)
  return Math.max(0, el.offsetWidth - el.clientWidth - border)
}

function applyLock(doc: Document, state: LockState, config: RuntimeConfig): void {
  const win = doc.defaultView ?? window
  const { el, page } = resolveTarget(doc, win, config)
  const gutter = measureGutter(el, page, doc, win)

  state.el = el
  state.page = page
  state.savedScrollY = win.scrollY
  state.savedScrollTop = el.scrollTop
  state.saved = {
    position: el.style.position,
    top: el.style.top,
    width: el.style.width,
    overflow: el.style.overflow,
    boxSizing: el.style.boxSizing,
    paddingInlineEnd: el.style.paddingInlineEnd,
  }

  const padding = Number.parseFloat(win.getComputedStyle(el).paddingInlineEnd) || 0
  if (page) {
    el.style.position = 'fixed'
    el.style.top = `-${state.savedScrollY}px`
    el.style.width = '100%'
    // 补的内距要从 width:100% 里扣掉，才抵得住滚动条让出的那段
    el.style.boxSizing = 'border-box'
  }
  el.style.overflow = 'hidden'
  if (gutter > 0)
    el.style.paddingInlineEnd = `${padding + gutter}px`
  doc.documentElement.style.setProperty(GUTTER_VAR, `${gutter}px`)

  if (!page)
    return

  // 旋屏 / 视口变化时重算负 top
  const recalc = (): void => {
    el.style.top = `-${state.savedScrollY}px`
  }
  state.onViewportChange = recalc
  win.addEventListener('orientationchange', recalc)
  win.visualViewport?.addEventListener('resize', recalc)
}

function releaseLock(doc: Document, state: LockState): void {
  const win = doc.defaultView ?? window
  const el = state.el
  if (!el)
    return
  el.style.position = state.saved.position
  el.style.top = state.saved.top
  el.style.width = state.saved.width
  el.style.overflow = state.saved.overflow
  el.style.boxSizing = state.saved.boxSizing
  el.style.paddingInlineEnd = state.saved.paddingInlineEnd
  doc.documentElement.style.removeProperty(GUTTER_VAR)
  if (state.onViewportChange) {
    win.removeEventListener('orientationchange', state.onViewportChange)
    win.visualViewport?.removeEventListener('resize', state.onViewportChange)
    state.onViewportChange = null
  }
  if (state.page)
    win.scrollTo(0, state.savedScrollY)
  else
    el.scrollTop = state.savedScrollTop
  state.el = null
}

/** 加一把滚动锁。多层叠加走引用计数，只有第一次真正加锁、最后一次真正解锁。 */
export function acquireScrollLock(o: ScrollLockOptions): ScrollLockHandle {
  const doc = o.config.scope.getDoc()
  const state = registry.get(doc)
  let disposed = false

  if (state.count === 0)
    applyLock(doc, state, o.config)
  state.count += 1

  return {
    dispose() {
      if (disposed)
        return
      disposed = true
      state.count -= 1
      if (state.count === 0)
        releaseLock(doc, state)
    },
  }
}
