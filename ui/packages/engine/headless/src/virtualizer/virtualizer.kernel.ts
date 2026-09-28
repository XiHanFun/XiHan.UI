/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/**
 * 虚拟滚动内核：把几何计算接到一个真实的滚动容器上。
 * 它持有实测尺寸账本、视口尺寸与滚动量，挂滚动容器的 scroll 监听与 ResizeObserver，
 * 算出"此刻该渲哪几条、各自落在哪儿"，变了就回调一次。
 *
 * 滚动容器有两种：视口节点自己（overflow 容器），或整个窗口。两者只在"读滚动量、量可视尺寸、
 * 写回滚动量、列表起点在滚动坐标系里的位置"这四件事上不同，收在 ScrollTarget 里；其余逻辑共用。
 */

import type { Scope } from '@xihan-ui/core'
import type { VirtualizerAlign, VirtualizerMeasurement, VirtualizerMetrics, VirtualizerRange } from './virtualizer.geometry'
import type { VirtualizerItemState, VirtualizerSnapshot } from './virtualizer.sizing'
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

/** 滚动容器：视口节点自己滚，或者列表铺在页面里、随窗口滚。 */
export type VirtualizerScrollContainer = 'viewport' | 'window'

/** 内容增减时钉住哪一头：start 钉住视口里第一条，end 在已经滚到底时继续贴底（聊天流）。 */
export type VirtualizerAnchor = 'start' | 'end'

/** 贴底判定的容差（px）：滚动量是小数、各引擎取整不同，差一像素也算在底。 */
const END_TOLERANCE = 1

export interface VirtualizerKernelOptions extends VirtualizerMetrics {
  overscan: number
  /** 主轴是行内轴。决定读 scrollLeft 还是 scrollTop、量 offsetWidth 还是 offsetHeight。 */
  horizontal: boolean
  /** 滚动容器，缺省 viewport。 */
  scrollContainer?: VirtualizerScrollContainer
  /** 内容增减时钉住哪一头，缺省 start。 */
  anchor?: VirtualizerAnchor
  /** 分组标题等要钉在视口起点的条目下标。 */
  stickyIndices?: readonly number[]
  /**
   * 惰性取视口节点：适配器提交完这一帧节点才存在。
   * viewport 形态下它就是滚动容器；window 形态下只用来量列表在页面里的起点。
   */
  getScrollElement: () => HTMLElement | null
  /** 惰性取撑出总长的那层：它长高之后，被浏览器夹住的滚动写回才能补上。 */
  getContentElement?: () => HTMLElement | null
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

/** 滚动容器的四件事。元素与窗口各一份实现，其余逻辑不分形态。 */
interface ScrollTarget {
  /** 容器身份：换了容器要重新接线。 */
  readonly node: object
  offset: () => number
  /** 可视区的主轴尺寸与交叉轴尺寸。 */
  viewport: () => { width: number, height: number }
  /** 滚动行程上限。 */
  max: () => number
  scrollTo: (offset: number) => void
  /** 列表起点在滚动坐标系里的位置：窗口形态量视口节点在文档里的位置，元素形态恒 0。 */
  listStart: () => number
  /** 挂滚动与尺寸监听，返回摘除函数。 */
  listen: (onScroll: () => void, onResize: () => void) => () => void
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

function elementTarget(el: HTMLElement, horizontal: boolean, scope: Scope): ScrollTarget {
  return {
    node: el,
    offset: () => finite(horizontal ? el.scrollLeft : el.scrollTop),
    viewport: () => ({ width: Math.round(el.offsetWidth), height: Math.round(el.offsetHeight) }),
    max: () => {
      const span = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight
      return Number.isFinite(span) && span > 0 ? span : 0
    },
    scrollTo: (offset) => {
      const axis = horizontal ? 'left' : 'top'
      if (typeof el.scrollTo === 'function')
        el.scrollTo({ [axis]: offset })
      else if (horizontal)
        el.scrollLeft = offset
      else
        el.scrollTop = offset
    },
    listStart: () => 0,
    listen: (onScroll, onResize) => {
      // 不拦滚动、不 preventDefault，用 passive 监听
      el.addEventListener('scroll', onScroll, { passive: true })
      // 无布局环境没有 ResizeObserver：视口尺寸不再自动跟随，显式重排仍会重量
      const win = scope.getWin()
      const observer = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(onResize) : null
      observer?.observe(el)
      return () => {
        el.removeEventListener('scroll', onScroll)
        observer?.disconnect()
      }
    },
  }
}

/**
 * 窗口形态：列表铺在页面里，滚的是整页。
 * 列表起点每次滚动都现量：页头折叠、上方内容加载完都会挪动它，量一次的值很快就过期。
 */
function windowTarget(win: Window, list: HTMLElement, horizontal: boolean): ScrollTarget {
  const root = (): HTMLElement => win.document.documentElement
  return {
    node: win,
    offset: () => finite(horizontal ? win.scrollX : win.scrollY),
    viewport: () => ({ width: Math.round(root().clientWidth || win.innerWidth), height: Math.round(root().clientHeight || win.innerHeight) }),
    max: () => {
      const span = horizontal ? root().scrollWidth - root().clientWidth : root().scrollHeight - root().clientHeight
      return Number.isFinite(span) && span > 0 ? span : 0
    },
    scrollTo: (offset) => {
      if (typeof win.scrollTo === 'function')
        win.scrollTo(horizontal ? { left: offset } : { top: offset })
    },
    listStart: () => {
      if (!list.isConnected)
        return 0
      const rect = list.getBoundingClientRect()
      return Math.max(0, Math.round(horizontal ? rect.left + win.scrollX : rect.top + win.scrollY))
    },
    listen: (onScroll, onResize) => {
      win.addEventListener('scroll', onScroll, { passive: true })
      win.addEventListener('resize', onResize)
      return () => {
        win.removeEventListener('scroll', onScroll)
        win.removeEventListener('resize', onResize)
      }
    },
  }
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

/** 钉在起点的条目下标：去重、去掉非法值、升序。 */
function normalizeSticky(indices: readonly number[] | undefined, count: number): number[] {
  if (!indices || indices.length === 0)
    return []
  const out = new Set<number>()
  for (const raw of indices) {
    if (Number.isFinite(raw) && raw >= 0 && raw < count)
      out.add(Math.trunc(raw))
  }
  return [...out].sort((a, b) => a - b)
}

export function createVirtualizerKernel(initial: VirtualizerKernelOptions, scope: Scope): VirtualizerKernel {
  let options = initial
  /** 列表起点在滚动坐标系里的位置，窗口形态才非 0；计入 scrollMargin。 */
  let listStart = 0
  let metrics = normalizeVirtualizerMetrics({ ...initial, scrollMargin: initial.scrollMargin + listStart })

  let target: ScrollTarget | null = null
  let viewportWidth = 0
  let viewportHeight = 0
  let scrollOffset = 0
  /** 上一次滚动的方向，重排补偿据此决定要不要动滚动量。 */
  let backward = false
  let scrolling = false
  /** end 形态下此刻贴着底：内容再长也继续贴底。起始即贴底，列表从最新那条看起。 */
  let pinnedToEnd = (initial.anchor ?? 'start') === 'end'
  /**
   * 还没落地的滚动写回：内容层长高之前写进去的值会被浏览器夹到旧的尽头，
   * 等内容层长高（ResizeObserver 回报）再补一次，落地即清。
   */
  let pendingOffset: number | null = null

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

  let detachTarget: (() => void) | undefined
  let contentEl: HTMLElement | null = null
  let contentObserver: ResizeObserver | null = null
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let itemObserver: ResizeObserver | null = null
  const observedItems = new Set<HTMLElement>()
  let disposed = false

  const viewportSize = (): number => (options.horizontal ? viewportWidth : viewportHeight)
  const anchoredToEnd = (): boolean => (options.anchor ?? 'start') === 'end'

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

  /** 按账本算出的滚动行程上限：浏览器的 scrollHeight 要等内容层重绘才跟上，这里先算出来。 */
  function endOffset(): number {
    const total = virtualizerTotalSize(getMeasurements(), metrics) + metrics.scrollMargin
    return Math.max(0, total - viewportSize())
  }

  /** 写回滚动量。被浏览器夹住的那部分记成待补，内容层长高后再补。 */
  function requestScroll(offset: number): void {
    scrollOffset = offset
    if (!target)
      return
    pendingOffset = offset
    target.scrollTo(offset)
    if (Math.abs(target.offset() - offset) <= END_TOLERANCE)
      pendingOffset = null
  }

  /**
   * 以容器上的实际滚动量为准：scroll 事件要等下一帧才到，在那之前改了条目、重新接线，
   * 手里的滚动量还是旧的，拿它找锚点、判贴底都会错。自己的写回还没落地时不读。
   */
  function syncLiveOffset(): void {
    if (!target || pendingOffset != null)
      return
    const live = target.offset()
    if (live === scrollOffset)
      return
    backward = live < scrollOffset
    scrollOffset = live
    if (anchoredToEnd())
      pinnedToEnd = live >= target.max() - END_TOLERANCE
  }

  /** end 形态且贴着底：把滚动量推到新的尽头。 */
  function followEnd(): void {
    syncLiveOffset()
    if (!anchoredToEnd() || !pinnedToEnd || !target)
      return
    const next = endOffset()
    if (Math.abs(next - scrollOffset) > END_TOLERANCE || pendingOffset != null)
      requestScroll(next)
  }

  /** 列表起点挪了（窗口形态）：连带 scrollMargin 一起换，整份重排。 */
  function refreshListStart(): boolean {
    const next = target ? target.listStart() : 0
    if (next === listStart)
      return false
    listStart = next
    const nextMetrics = normalizeVirtualizerMetrics({ ...options, scrollMargin: options.scrollMargin + listStart })
    metrics = nextMetrics
    markDirty(0)
    return true
  }

  /** 量可视区。没有 ResizeObserver 的环境靠每次显式重排调它跟上尺寸变化。 */
  function measureViewport(): void {
    if (!target)
      return
    const size = target.viewport()
    viewportWidth = size.width
    viewportHeight = size.height
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

  function onScroll(): void {
    if (!target)
      return
    const next = target.offset()
    if (pendingOffset != null) {
      // 自己写回引起的滚动：落地了就清；被夹在旧尽头的那一下不算用户在滚，等内容层长高再补
      if (Math.abs(next - pendingOffset) <= END_TOLERANCE) {
        pendingOffset = null
      }
      else if (next >= target.max() - END_TOLERANCE && next < pendingOffset) {
        return
      }
      else {
        pendingOffset = null
      }
    }
    if (next !== scrollOffset)
      backward = next < scrollOffset
    scrollOffset = next
    if (anchoredToEnd())
      pinnedToEnd = next >= target.max() - END_TOLERANCE
    refreshListStart()
    scrolling = true
    restartIdleTimer()
    maybeNotify()
  }

  function onResize(): void {
    measureViewport()
    const moved = refreshListStart()
    followEnd()
    if (moved)
      notify()
    else
      maybeNotify()
  }

  /** 内容层长高了：补上被夹住的写回，贴底的继续贴底。 */
  function onContentResize(): void {
    if (!target || disposed)
      return
    if (pendingOffset != null) {
      target.scrollTo(pendingOffset)
      if (Math.abs(target.offset() - pendingOffset) <= END_TOLERANCE)
        pendingOffset = null
    }
    followEnd()
  }

  function observeContent(): void {
    const next = options.getContentElement?.() ?? null
    if (next === contentEl)
      return
    contentObserver?.disconnect()
    contentObserver = null
    contentEl = next
    if (!next)
      return
    const win = scope.getWin()
    if (typeof win.ResizeObserver !== 'function')
      return
    contentObserver = new win.ResizeObserver(onContentResize)
    contentObserver.observe(next)
  }

  function attach(next: ScrollTarget): void {
    target = next
    measureViewport()
    refreshListStart()
    scrollOffset = next.offset()
    detachTarget = next.listen(onScroll, onResize)
    observeContent()
    followEnd()
  }

  function detach(): void {
    stopIdleTimer()
    detachTarget?.()
    detachTarget = undefined
    contentObserver?.disconnect()
    contentObserver = null
    contentEl = null
    target = null
    pendingOffset = null
    scrolling = false
  }

  /** 按当前选项解出滚动容器。窗口形态下视口节点还没挂上就先不接。 */
  function resolveTarget(): ScrollTarget | null {
    const el = options.getScrollElement()
    if (!el)
      return null
    if ((options.scrollContainer ?? 'viewport') === 'window')
      return target && target.node === scope.getWin() ? target : windowTarget(scope.getWin(), el, options.horizontal)
    return target && target.node === el ? target : elementTarget(el, options.horizontal, scope)
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

  /** 视口里第一条的身份与它离视口起点的距离：条目增删之后按身份找回它、放回原处。 */
  function captureAnchor(): { key: string | number, delta: number } | null {
    if (!target || metrics.count === 0)
      return null
    const range = currentRange()
    if (!range)
      return null
    const item = getMeasurements()[range.startIndex]
    return item ? { key: item.key, delta: item.start - scrollOffset } : null
  }

  /**
   * 按身份找回锚点条目，把它放回原来离视口起点的距离：往前插了条目（向上翻出历史）时视口不跳。
   * 身份默认就是下标，没给 getItemKey 时插在前面的条目会把锚点顶走，只能保住下标不保住内容。
   */
  function restoreAnchor(anchor: { key: string | number, delta: number }): void {
    const items = getMeasurements()
    const item = items.find(candidate => candidate.key === anchor.key)
    if (!item)
      return
    const next = Math.max(0, item.start - anchor.delta)
    if (Math.abs(next - scrollOffset) > END_TOLERANCE)
      requestScroll(next)
  }

  /**
   * 把一条的实测尺寸记进账本。
   * 整条都在视口上方的那些条变了尺寸要同步补偿滚动量，否则下方内容会当场跳一下。
   * 往回滚时不补偿：补偿本身会改滚动量，与用户的上滚方向打架，一路追下去就成了停不住的跳动。
   * 贴底时也不补偿：内容长多少都整体推到新的尽头。
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

    if (anchoredToEnd() && pinnedToEnd)
      followEnd()
    else if (aboveFold && target)
      requestScroll(Math.max(0, scrollOffset + delta))

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
      syncLiveOffset()
      const anchor = captureAnchor()
      const nextMetrics = normalizeVirtualizerMetrics({ ...next, scrollMargin: next.scrollMargin + listStart })
      const reshaped = nextMetrics.count !== metrics.count || nextMetrics.getItemKey !== metrics.getItemKey
      if (layoutChanged(metrics, nextMetrics))
        markDirty(0)
      else if (nextMetrics.count !== metrics.count)
        markDirty(Math.min(nextMetrics.count, metrics.count))
      const becameEnd = (next.anchor ?? 'start') === 'end' && (options.anchor ?? 'start') !== 'end'
      options = next
      metrics = nextMetrics
      if (becameEnd)
        pinnedToEnd = true
      // 条目增删：贴底的继续贴底，否则把视口里第一条放回原处
      if (reshaped && anchoredToEnd() && pinnedToEnd)
        followEnd()
      else if (reshaped && anchor)
        restoreAnchor(anchor)
    },

    sync: () => {
      if (disposed)
        return
      const next = resolveTarget()
      if (next !== target) {
        detach()
        if (next)
          attach(next)
        return
      }
      measureViewport()
      refreshListStart()
      observeContent()
      followEnd()
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
      // 钉在起点的那一条：可视区首条之前（含首条）最后一个登记过的下标，滚过它之后它一直钉着
      const sticky = normalizeSticky(options.stickyIndices, metrics.count)
      let active: number | null = null
      for (const index of sticky) {
        if (index > range.startIndex)
          break
        active = index
      }
      const toState = (item: VirtualizerMeasurement, pinned: boolean): VirtualizerItemState => ({
        // 对外一律报"距 content 起点"的位移，作者不必自己减 scrollMargin
        index: item.index,
        key: item.key,
        start: item.start - margin,
        end: item.end - margin,
        size: item.size,
        lane: item.lane,
        sticky: pinned,
      })
      const visible: VirtualizerItemState[] = []
      // 钉住的那条已滚出窗口时补在最前：它的下标比窗口里任何一条都小，升序不乱
      if (active != null && active < window.from && items[active])
        visible.push(toState(items[active]!, true))
      for (let index = window.from; index <= window.to; index++) {
        const item = items[index]
        if (item)
          visible.push(toState(item, index === active))
      }
      return { items: visible, totalSize: total, startIndex: range.startIndex, endIndex: range.endIndex }
    },

    isScrolling: () => scrolling,

    scrollToIndex: (index, align) => {
      if (disposed || !target || !Number.isFinite(index))
        return
      const items = getMeasurements()
      if (items.length === 0)
        return
      const item = items[Math.max(0, Math.min(Math.trunc(index), items.length - 1))]
      if (!item)
        return
      const next = virtualizerOffsetForItem(item, align, scrollOffset, viewportSize(), Math.max(target.max(), endOffset()))
      if (next === scrollOffset)
        return
      backward = next < scrollOffset
      if (anchoredToEnd())
        pinnedToEnd = next >= endOffset() - END_TOLERANCE
      scrolling = true
      restartIdleTimer()
      requestScroll(next)
      // 程序化滚动不能等浏览器稍后派 scroll 才发布窗口：集合焦点要在同一轮提交里等到目标条目。
      maybeNotify()
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
      followEnd()
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
