import type { Disposable, RuntimeConfig } from '@xihan-ui/core'

/** 距底多少 px 起算「在底」。留出一行多的余量，免得最后一行没露全就被判成不在底。 */
export const STICK_TO_BOTTOM_THRESHOLD = 64

export interface StickToBottomState {
  /** 几何事实：当前滚动位置是否落在底部阈值内。 */
  readonly atBottom: boolean
  /** 粘附意图：内容增长时是否自动跟到底。用户上滚即为 false。 */
  readonly sticking: boolean
}

export interface StickToBottomOptions {
  config: RuntimeConfig
  /** 滚动容器。惰性 getter：宿主可能晚一拍才把节点挂上。 */
  scrollEl: () => HTMLElement | null
  /** 内容容器，尺寸变化的观察目标。 */
  contentEl: () => HTMLElement | null
  /** 距底多少 px 视为在底。默认 64。 */
  threshold?: number
  /** 状态跃迁时回调（值真变才调）。 */
  onChange?: (state: StickToBottomState) => void
}

export interface StickToBottomHandle extends Disposable {
  readonly state: () => StickToBottomState
  /** 归位到底部并重新粘附。缺省 'smooth'；reducedMotion 为真时强制 'instant'。 */
  scrollToBottom: (behavior?: 'smooth' | 'instant') => void
  /**
   * 重新读取 scrollEl / contentEl 并按需解绑重绑。
   * 宿主节点晚一拍才出现（`v-if` 等接口返回、空壳先插入随后填角色节点）时必须调一次，
   * 否则句柄会一直绑在构造那一刻的旧节点（或 null）上，状态在跑而监听没挂。
   */
  retarget: () => void
}

/** 锚点：不粘附时用来把可视区钉在同一段内容上。 */
interface Anchor {
  el: HTMLElement
  delta: number
}

/**
 * 跟随内容增长把滚动容器保持在底部，用户一上滚就撒手。
 *
 * 不依赖 CSS `overflow-anchor`（Safari 至今不支持），增高补偿一律在 ResizeObserver
 * 回调里同步写 `scrollTop` 完成——同步写才不会先闪一帧旧位置。
 */
export function createStickToBottom(o: StickToBottomOptions): StickToBottomHandle {
  const threshold = o.threshold ?? STICK_TO_BOTTOM_THRESHOLD
  const win = o.config.scope.getWin()

  // 初值不去读几何：构造这一刻宿主还没渲染内容，读出来的 0/0 只会得到假状态；
  // 真实几何由第一次 scroll / RO 回调补上。
  let atBottom = true
  let sticking = true
  let disposed = false
  // 补偿窗口：这期间的 scroll 多半是我们自己写 scrollTop 引发的（也包括内容变矮时
  // 浏览器把 scrollTop 夹小），不能当成用户意图去改粘附。
  // 注意这只是时间窗近似：它区分不了同一帧内混进来的真实用户滚动，那种滚动的粘附意图会被吞掉。
  // 所以窗口内仍要重选锚点（见 onScroll），至少别让下一拍按陈旧锚把用户刚滚到的位置改写回去。
  let sizeAdjusting = false
  let sizeToken = 0
  let lastScrollTop = 0
  let anchor: Anchor | null = null
  let observer: ResizeObserver | null = null
  // 当前真正绑上监听/观察的那两个节点，retarget 靠它们判断要不要重绑
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
    // 同步通知、不节流：scroll 本身已被浏览器按帧合并，再叠一层只会让按钮慢半拍
    o.onChange?.({ atBottom, sticking })
  }

  function unstick(): void {
    if (disposed)
      return
    apply(atBottom, false)
  }

  /**
   * 在 contentEl 的直接子节点里线性取最后一个「可见且 offsetTop <= scrollTop」者。
   *
   * 不二分：`display:none` 的子节点 offsetTop 恒为 0（聊天里 `v-show` 的「思考中」气泡就是这么写的），
   * 绝对定位与 flex `order` 重排同样打破 offsetTop 随下标单调递增这个前提，二分会挑中错的那个。
   * 消息列表这个数量级下线性扫完全够用，还天然不依赖单调性。
   */
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
      // offsetParent 为 null 才是「这个节点没在布局里」：display:none、position:fixed、脱离文档三种情况。
      // 严格比 null，不写 falsy 判断——0 与空串不是这个属性的合法取值，宽松判断只会把噪音也接进来
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
      // 只有最后一次开窗有权关窗，否则连着几次尺寸变化会被先到的清理提前放行
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
      // 窗口内只更新几何事实，绝不动粘附意图；但锚点必须跟着走：
      // 窗口内重选是幂等的（要么落在我们刚写的位置，要么落在浏览器夹取后的合法位置），
      // 不重选的话下一拍 onResize 会按陈旧锚把用户刚滚到的位置改写回去
      apply(nextAtBottom, sticking)
      lastScrollTop = top
      pickAnchor(top)
      return
    }
    // 用户上滚脱锚必须落在 scroll 上：拖滚动条、中键自动滚、Ctrl+F 跳转、scrollIntoView、
    // 焦点跳转引发的自动滚动都只产生 scroll，wheel/touchmove/keydown 一个都收不到。
    // 程序化滚动不受影响：本原语自己写的 scrollTop 一律向下（归位到底、增高补偿），top 只增不减；
    // 「内容变矮时浏览器夹小 scrollTop」这条假上滚已经被上面的补偿窗口挡在前面了。
    const scrolledUp = top < lastScrollTop
    // 重新滚回阈值内即自动恢复粘附（只在由假变真的那一下，否则会把刚脱的锚又粘回去）
    const nextSticking = scrolledUp ? false : (nextAtBottom && !atBottom ? true : sticking)
    apply(nextAtBottom, nextSticking)
    lastScrollTop = top
    pickAnchor(top)
  }

  // wheel / touchmove / keydown 是 scroll 之外的提前量：滚到顶了再往上滚不会有 scroll 事件，
  // 光靠 scroll 收不到这一下
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
      // 上方内容变高时把可视区钉回锚元素，避免读到一半被推走；锚失联或转为隐藏就什么都不做，
      // 下一次 scroll 自然重选。隐藏节点的 offsetTop 恒为 0，照着补偿会把视口直接甩到底部
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
      // 原生平滑滚动天生跟随内容尺寸变化，不必自己驱动 scrollTop
      if (typeof el.scrollTo === 'function')
        el.scrollTo({ top: el.scrollHeight, behavior: mode })
      else
        el.scrollTop = el.scrollHeight - el.clientHeight
    }
    // 立刻置粘附，不等动画落地：等动画结束才置位，回到底部按钮会闪一下又出现
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
    // 锚点是旧内容里的节点，跟着一起丢
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

    // jsdom / SSR 没有 ResizeObserver：降级成「只跟滚动、不跟尺寸」，不抛
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
