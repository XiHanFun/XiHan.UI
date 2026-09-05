/**
 * 虚拟滚动内核：把几何计算接到一个真实的滚动容器上。
 * 它持有实测尺寸账本、视口尺寸与滚动量，挂视口的 scroll 监听与两处 ResizeObserver，
 * 算出"此刻该渲哪几条、各自落在哪儿"，变了就回调一次。
 */

import type { Scope } from '@xihan-ui/core'
import type { VirtualizerAlign, VirtualizerMeasurement, VirtualizerMetrics, VirtualizerRange } from './virtualizer.geometry'
import type { VirtualizerSnapshot } from './virtualizer.sizing'
import {
  expandVirtualizerRange,
  findVirtualizerRange,
  measureVirtualizerItems,
  normalizeVirtualizerMetrics,
  resolveVirtualizerOverscan,
  virtualizerOffsetForItem,
  virtualizerTotalSize,
} from './virtualizer.geometry'
import { VIRTUALIZER_EMPTY_SNAPSHOT } from './virtualizer.sizing'

/** 停手判定：最后一次 scroll 事件之后静默这么久就算停下了。 */
export const VIRTUALIZER_SCROLL_IDLE_DELAY = 150

/** 条目节点自报下标用的属性，内核按它反查节点是第几条。 */
export const VIRTUALIZER_INDEX_ATTRIBUTE = 'data-index'

export interface VirtualizerKernelOptions extends VirtualizerMetrics {
  overscan: number
  /** 主轴是行内轴。决定读 scrollLeft 还是 scrollTop、量 offsetWidth 还是 offsetHeight。 */
  horizontal: boolean
  /** 惰性取滚动容器：适配器提交完这一帧节点才存在。 */
  getScrollElement: () => HTMLElement | null
  /** 该渲什么变了。同步调用。 */
  onChange: () => void
}

export interface VirtualizerKernel {
  /** 换一份排布参数。只有影响排布的字段变了才作废已排好的几何。 */
  setOptions: (options: VirtualizerKernelOptions) => void
  /** 重新接滚动容器并重量视口。容器没换时只重量。不回调。 */
  sync: () => void
  /** 此刻该渲什么。位移已折算成"距 content 起点"。 */
  read: () => VirtualizerSnapshot
  /** 手正在滚。 */
  isScrolling: () => boolean
  /** 滚到第几条。越界下标夹住，非有限值忽略。 */
  scrollToIndex: (index: number, align: VirtualizerAlign) => void
  /** 把条目节点的真实尺寸记进账本。 */
  measureElement: (element: HTMLElement) => void
  /** 丢掉全部实测尺寸，整份按估算值重排。 */
  reset: () => void
  dispose: () => void
}

/** 干净标记：没有任何下标需要重排。 */
const CLEAN = Number.POSITIVE_INFINITY

/** 只有这几个字段变了才要整份重排；estimateSize 换了不重排，它的新值随下一次重排生效。 */
function layoutChanged(a: VirtualizerMetrics, b: VirtualizerMetrics): boolean {
  return a.gap !== b.gap
    || a.paddingStart !== b.paddingStart
    || a.scrollMargin !== b.scrollMargin
    || a.lanes !== b.lanes
    || a.getItemKey !== b.getItemKey
}

export function createVirtualizerKernel(initial: VirtualizerKernelOptions, scope: Scope): VirtualizerKernel {
  let options = initial
  let metrics = normalizeVirtualizerMetrics(initial)

  let scrollEl: HTMLElement | null = null
  let viewportWidth = 0
  let viewportHeight = 0
  let scrollOffset = 0
  /** 上一次滚动的方向，重排补偿据此决定要不要动滚动量。 */
  let backward = false
  let scrolling = false

  /** 实测尺寸账本，按条目身份记账，条目增删也跟得住。 */
  const sizes = new Map<string | number, number>()
  let measurements: VirtualizerMeasurement[] = []
  let dirtyFrom = 0

  /** 已上报过的那一份，用来判断这次变化值不值得回调。 */
  let reported: { scrolling: boolean, startIndex: number | null, endIndex: number | null } = {
    scrolling: false,
    startIndex: null,
    endIndex: null,
  }

  let detachViewport: (() => void) | undefined
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let itemObserver: ResizeObserver | null = null
  const observedItems = new Set<HTMLElement>()
  let disposed = false

  const viewportSize = (): number => (options.horizontal ? viewportWidth : viewportHeight)

  function markDirty(from: number): void {
    if (from < dirtyFrom)
      dirtyFrom = from
  }

  function getMeasurements(): readonly VirtualizerMeasurement[] {
    if (dirtyFrom !== CLEAN) {
      measurements = measureVirtualizerItems(metrics, sizes, measurements, dirtyFrom)
      dirtyFrom = CLEAN
    }
    return measurements
  }

  function currentRange(): VirtualizerRange | null {
    return findVirtualizerRange(getMeasurements(), scrollOffset, viewportSize(), metrics.lanes)
  }

  /** 值真变了才回调。滚动量变了但区间没变的那些帧不该惊动上层。 */
  function maybeNotify(): void {
    if (disposed)
      return
    const range = currentRange()
    const startIndex = range ? range.startIndex : null
    const endIndex = range ? range.endIndex : null
    if (scrolling === reported.scrolling && startIndex === reported.startIndex && endIndex === reported.endIndex)
      return
    reported = { scrolling, startIndex, endIndex }
    options.onChange()
  }

  /** 尺寸账本或排布参数变了：区间可能一动不动，但位移全变了，必须回调。 */
  function notify(): void {
    if (disposed)
      return
    const range = currentRange()
    reported = {
      scrolling,
      startIndex: range ? range.startIndex : null,
      endIndex: range ? range.endIndex : null,
    }
    options.onChange()
  }

  function readScrollOffset(el: HTMLElement): number {
    const raw = options.horizontal ? el.scrollLeft : el.scrollTop
    return Number.isFinite(raw) ? raw : 0
  }

  /** 滚动行程的上限。滚过头的目标位置由它夹住。 */
  function maxScrollOffset(): number {
    if (!scrollEl)
      return 0
    const span = options.horizontal
      ? scrollEl.scrollWidth - scrollEl.clientWidth
      : scrollEl.scrollHeight - scrollEl.clientHeight
    return Number.isFinite(span) && span > 0 ? span : 0
  }

  function scrollTo(offset: number): void {
    if (!scrollEl)
      return
    const axis = options.horizontal ? 'left' : 'top'
    if (typeof scrollEl.scrollTo === 'function')
      scrollEl.scrollTo({ [axis]: offset })
    else if (options.horizontal)
      scrollEl.scrollLeft = offset
    else
      scrollEl.scrollTop = offset
  }

  /** 量视口的边框盒。没有 ResizeObserver 的环境靠每次显式重排调它跟上尺寸变化。 */
  function measureViewport(): void {
    if (!scrollEl)
      return
    viewportWidth = Math.round(scrollEl.offsetWidth)
    viewportHeight = Math.round(scrollEl.offsetHeight)
  }

  function stopIdleTimer(): void {
    if (idleTimer != null) {
      clearTimeout(idleTimer)
      idleTimer = undefined
    }
  }

  function restartIdleTimer(): void {
    stopIdleTimer()
    idleTimer = setTimeout(() => {
      idleTimer = undefined
      scrolling = false
      maybeNotify()
    }, VIRTUALIZER_SCROLL_IDLE_DELAY)
  }

  function attach(el: HTMLElement): void {
    scrollEl = el
    measureViewport()
    scrollOffset = readScrollOffset(el)

    const onScroll = (): void => {
      const next = readScrollOffset(el)
      if (next !== scrollOffset)
        backward = next < scrollOffset
      scrollOffset = next
      scrolling = true
      restartIdleTimer()
      maybeNotify()
    }
    // 不拦滚动、不 preventDefault，用 passive 监听
    el.addEventListener('scroll', onScroll, { passive: true })

    // 无布局环境没有 ResizeObserver：视口尺寸不再自动跟随，显式重排仍会重量
    const win = scope.getWin()
    const observer = typeof win.ResizeObserver === 'function'
      ? new win.ResizeObserver(() => {
          measureViewport()
          maybeNotify()
        })
      : null
    observer?.observe(el)

    detachViewport = () => {
      el.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }

  function detach(): void {
    stopIdleTimer()
    detachViewport?.()
    detachViewport = undefined
    scrollEl = null
    scrolling = false
  }

  function indexFromElement(el: HTMLElement): number | null {
    const raw = el.getAttribute(VIRTUALIZER_INDEX_ATTRIBUTE)
    if (raw == null)
      return null
    const index = Number.parseInt(raw, 10)
    return Number.isFinite(index) && index >= 0 ? index : null
  }

  function readItemSize(el: HTMLElement): number {
    return Math.round(options.horizontal ? el.offsetWidth : el.offsetHeight)
  }

  /**
   * 把一条的实测尺寸记进账本。
   * 整条都在视口上方的那些条变了尺寸要同步补偿滚动量，否则下方内容会当场跳一下。
   * 往回滚时不补偿：补偿本身会改滚动量，与用户的上滚方向打架，一路追下去就成了停不住的跳动。
   */
  function resizeItem(index: number, size: number): void {
    if (!Number.isFinite(size) || size < 0)
      return
    const item = getMeasurements()[index]
    if (!item)
      return

    const previous = sizes.get(item.key) ?? item.size
    const delta = size - previous
    if (delta === 0)
      return

    const firstMeasure = !sizes.has(item.key)
    const aboveFold = firstMeasure
      ? item.start < scrollOffset
      : item.start + previous <= scrollOffset && !backward

    sizes.set(item.key, size)
    markDirty(index)

    if (aboveFold && scrollEl) {
      const next = Math.max(0, scrollOffset + delta)
      scrollOffset = next
      scrollTo(next)
    }

    notify()
  }

  /** 条目节点的尺寸变化也要跟：图片加载完、字体换掉都不经过适配器的更新钩子。 */
  function observeItem(el: HTMLElement): void {
    if (observedItems.has(el))
      return
    if (!itemObserver) {
      const win = scope.getWin()
      if (typeof win.ResizeObserver !== 'function')
        return
      itemObserver = new win.ResizeObserver((entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement
          if (!node.isConnected) {
            itemObserver?.unobserve(node)
            observedItems.delete(node)
            continue
          }
          const index = indexFromElement(node)
          if (index != null)
            resizeItem(index, readItemSize(node))
        }
      })
    }
    itemObserver.observe(el)
    observedItems.add(el)
  }

  return {
    setOptions: (next) => {
      if (disposed)
        return
      const nextMetrics = normalizeVirtualizerMetrics(next)
      if (layoutChanged(metrics, nextMetrics))
        markDirty(0)
      else if (nextMetrics.count !== metrics.count)
        markDirty(Math.min(nextMetrics.count, metrics.count))
      options = next
      metrics = nextMetrics
    },

    sync: () => {
      if (disposed)
        return
      const next = options.getScrollElement()
      if (next !== scrollEl) {
        detach()
        if (next)
          attach(next)
        return
      }
      measureViewport()
      if (scrollEl)
        scrollOffset = readScrollOffset(scrollEl)
    },

    read: () => {
      if (disposed)
        return VIRTUALIZER_EMPTY_SNAPSHOT
      const items = getMeasurements()
      const range = currentRange()
      const total = virtualizerTotalSize(items, metrics)
      if (!range)
        return { items: [], totalSize: total, startIndex: null, endIndex: null }

      const window = expandVirtualizerRange(range, resolveVirtualizerOverscan(options.overscan), metrics.count)
      const margin = metrics.scrollMargin
      const visible = []
      for (let index = window.from; index <= window.to; index++) {
        const item = items[index]
        if (!item)
          continue
        // 对外一律报"距 content 起点"的位移，作者不必自己减 scrollMargin
        visible.push({
          index: item.index,
          key: item.key,
          start: item.start - margin,
          end: item.end - margin,
          size: item.size,
          lane: item.lane,
        })
      }
      return { items: visible, totalSize: total, startIndex: range.startIndex, endIndex: range.endIndex }
    },

    isScrolling: () => scrolling,

    scrollToIndex: (index, align) => {
      if (disposed || !scrollEl || !Number.isFinite(index))
        return
      const items = getMeasurements()
      if (items.length === 0)
        return
      const item = items[Math.max(0, Math.min(Math.trunc(index), items.length - 1))]
      if (!item)
        return
      scrollTo(virtualizerOffsetForItem(item, align, scrollOffset, viewportSize(), maxScrollOffset()))
    },

    measureElement: (element) => {
      if (disposed)
        return
      const index = indexFromElement(element)
      if (index == null)
        return
      observeItem(element)
      resizeItem(index, readItemSize(element))
    },

    reset: () => {
      if (disposed)
        return
      sizes.clear()
      markDirty(0)
      notify()
    },

    dispose: () => {
      if (disposed)
        return
      disposed = true
      detach()
      itemObserver?.disconnect()
      itemObserver = null
      observedItems.clear()
      sizes.clear()
      measurements = []
    },
  }
}
