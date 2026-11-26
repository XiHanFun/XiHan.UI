/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 候选浮层滚到末端时请求下一页：Select、Combobox 的 onLoadMore 共用这一套判据。

import type { Cleanup } from '@xihan-ui/core'

/** 末端的容差：滚动量取整后差一像素也算到头，与 ScrollArea 的 onReachEnd 同一档。 */
const REACH_END_TOLERANCE = 1

export interface OverlayLoadMoreOptions {
  /** 浮层外壳。滚动面（列表本身，或开了虚拟化时的视口）都在它里面，每次挂监听时现取。 */
  getContainer: () => HTMLElement | null
  /** 此刻能不能请求：给了回调、不在途、没有取数失败、没有禁用。跨进末端那一下才问。 */
  enabled: () => boolean
  onLoadMore: () => void
  /** 推迟一拍再挂：进入展开态这一刻外壳未必已经交上来。 */
  flush: (fn: () => void) => void
}

/** 纵向滚动面是否已经到了末端。内容不溢出时不算，那时根本滚不动。 */
function atEnd(el: HTMLElement): boolean {
  const max = el.scrollHeight - el.clientHeight
  return max > REACH_END_TOLERANCE && el.scrollTop >= max - REACH_END_TOLERANCE
}

/**
 * scroll 不冒泡，监听挂在浮层外壳的捕获阶段：滚的是列表还是虚拟滚动的视口都接得住，
 * 不必知道作者把哪个盒子做成了滚动面。
 * 只在跨进末端的那一下请求，停在末端来回微滚不重复；跨进去那一刻在途、失败或禁用就不请求。
 * 到底时记下当时的内容高度：新一页接上、内容变长之后的末端是新的一处，哪怕一下就跳过去（End 键、命令式滚动）也照样请求。
 */
export function trackOverlayLoadMore(o: OverlayLoadMoreOptions): Cleanup {
  let disposed = false
  let container: HTMLElement | null = null
  // 每个滚动面上一次到底时的内容高度；不在末端时撤掉
  const reached = new WeakMap<Element, number>()

  const onScroll = (event: Event): void => {
    const target = event.target as Partial<HTMLElement> | null
    if (target?.nodeType !== 1)
      return
    const el = target as HTMLElement
    if (!atEnd(el)) {
      reached.delete(el)
      return
    }
    const height = el.scrollHeight
    if (reached.get(el) === height)
      return
    reached.set(el, height)
    if (o.enabled())
      o.onLoadMore()
  }

  o.flush(() => {
    if (disposed)
      return
    container = o.getContainer()
    container?.addEventListener('scroll', onScroll, { capture: true, passive: true })
  })

  return () => {
    disposed = true
    container?.removeEventListener('scroll', onScroll, { capture: true })
    container = null
  }
}
