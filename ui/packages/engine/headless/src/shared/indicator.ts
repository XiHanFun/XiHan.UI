/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 滑动指示器的共用几何：当前项相对列表容器的位置与尺寸，以及几时该重量。
//
// Tabs、Segmented、Anchor、NavigationMenu 的指示器都是容器里一个绝对定位的小元素，
// 位置交给 transform、尺寸交给 inline-size / block-size，数值由这里量出、连接层投成私有槽。

import type { Direction } from '@xihan-ui/core'
import { readDirection } from '@xihan-ui/core'

/** 指示器的盒子，逻辑方向：起始缘从行首 / 块首量起，单位 px。 */
export interface IndicatorBox {
  inlineStart: number
  blockStart: number
  inlineSize: number
  blockSize: number
}

/**
 * 量条目相对容器内衬盒的排布位。
 *
 * 沿 offsetParent 链累加到容器，量的是排布位而不是屏幕上的矩形：祖先的 transform
 * （对话框进场时的缩放、标签带的平移）不改变结果；getBoundingClientRect 在这些时候量到的
 * 是缩放后或位移半路上的值，指示器会跟着偏小、偏位。容器必须是条目的定位祖先
 * （指示器绝对定位于它），条目不在它的定位链里时返回 null。
 *
 * 起始缘按书写方向算：RTL 下从容器内衬盒的右缘往左量。方向缺省从容器的计算样式现读，
 * 祖先链上任意一处 dir 或 CSS direction 都算数。
 */
export function measureIndicatorBox(container: HTMLElement, item: HTMLElement, dir?: Direction): IndicatorBox | null {
  let left = 0
  let top = 0
  let node: HTMLElement | null = item
  while (node && node !== container) {
    left += node.offsetLeft
    top += node.offsetTop
    const parent = node.offsetParent as HTMLElement | null
    // offset* 从定位祖先的内衬边量起；越过中间一层定位祖先时补上它自己的描边
    if (parent && parent !== container) {
      left += parent.clientLeft
      top += parent.clientTop
    }
    node = parent
  }
  if (node !== container)
    return null
  const rtl = (dir ?? readDirection(container)) === 'rtl'
  return {
    inlineStart: rtl ? container.clientWidth - left - item.offsetWidth : left,
    blockStart: top,
    inlineSize: item.offsetWidth,
    blockSize: item.offsetHeight,
  }
}

/** 两次量测是否一样：作 cell 的 isEqual 用，量到同一结果不多推一次更新。 */
export function sameIndicatorBox(a: IndicatorBox | null, b: IndicatorBox | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.inlineStart === b.inlineStart && a.blockStart === b.blockStart
    && a.inlineSize === b.inlineSize && a.blockSize === b.blockSize
}

export interface IndicatorLayoutOptions {
  /** 指示器的定位容器。 */
  container: HTMLElement
  /** 会改变指示器落点的条目；条目增减后按它重新取一遍。 */
  items: () => Iterable<Element>
  /** 要重量了。同一帧里的多次变化只回调一次。 */
  onChange: () => void
}

/**
 * 盯住会让指示器错位的变化：容器与各条目的尺寸（容器变窄换行、条目文案变长）、
 * 条目增减、字体加载完成（换上正式字体后字宽变了）。宿主没有哪种观察器就少盯哪一路，
 * 选中值变化与组件自己的显式重量照常生效。
 */
export function trackIndicatorLayout(win: Window & typeof globalThis, options: IndicatorLayoutOptions): () => void {
  const { container, items, onChange } = options
  let disposed = false
  let frame = 0
  const schedule = (): void => {
    if (disposed || frame)
      return
    frame = win.requestAnimationFrame(() => {
      frame = 0
      if (!disposed)
        onChange()
    })
  }

  const ResizeObserverCtor = win.ResizeObserver
  const resizeObserver = typeof ResizeObserverCtor === 'function' ? new ResizeObserverCtor(schedule) : null
  const observeAll = (): void => {
    if (!resizeObserver)
      return
    resizeObserver.disconnect()
    resizeObserver.observe(container)
    for (const item of items())
      resizeObserver.observe(item)
  }
  observeAll()

  const MutationObserverCtor = win.MutationObserver
  const mutationObserver = typeof MutationObserverCtor === 'function'
    ? new MutationObserverCtor(() => {
        observeAll()
        schedule()
      })
    : null
  mutationObserver?.observe(container, { childList: true, subtree: true })

  const fonts = container.ownerDocument.fonts as FontFaceSet | undefined
  fonts?.addEventListener?.('loadingdone', schedule)

  return () => {
    disposed = true
    if (frame)
      win.cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    mutationObserver?.disconnect()
    fonts?.removeEventListener?.('loadingdone', schedule)
  }
}
