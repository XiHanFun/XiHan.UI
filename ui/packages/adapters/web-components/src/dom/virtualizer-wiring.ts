/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Virtualizer 的部件接线：视口、内容层与每个条目外壳。<xh-virtualizer> 与开了 virtual 的集合元素共用这一份，
// 后者按 virtual- 前缀的作者名把同一套部件摊在自己的 Light DOM 里。

import type { connectVirtualizer } from '@xihan-ui/headless'
import type { Spreader } from './spread'

type VirtualizerApi = ReturnType<typeof connectVirtualizer>

/** 条目外壳的下标取作者写的 value；漏写时给 NaN：与任何下标都不相等，绝不会冒充第 0 条。 */
function itemIndex(el: HTMLElement): number {
  const raw = el.getAttribute('value')
  return raw == null || raw === '' ? Number.NaN : Number(raw)
}

/** 这个条目要不要把真实尺寸回喂给内核。三态语义与 horizontal 属性一致。 */
function wantsMeasure(el: HTMLElement): boolean {
  const raw = el.getAttribute('measure')
  return raw !== null && raw !== 'false'
}

/**
 * 这个条目外壳此刻在不在窗口里。窗口外的外壳由宿主元素自己收起（setPartHidden）：
 * 收起留在元素里调，门禁按部件名判它收的是不是浮层。
 */
export function virtualItemInWindow(api: VirtualizerApi, el: HTMLElement): boolean {
  const index = itemIndex(el)
  return api.virtualItems.some(item => item.index === index)
}

/** 宿主交来的部件查找：部件名由宿主定（<xh-virtualizer> 用 viewport，集合元素用 virtual-viewport）。 */
export interface VirtualizerWiringHost {
  readonly viewport: () => HTMLElement | null
  readonly content: () => HTMLElement | null
  readonly items: () => HTMLElement[]
}

export class VirtualizerWiring {
  private readonly registered = new Set<number>()
  /** 已经交给内核量过的外壳：内核从此挂着自己的尺寸观察，后续变化由它报，不必每轮接线再量。 */
  private readonly measured = new WeakSet<HTMLElement>()

  constructor(private readonly spreader: Spreader, private readonly host: VirtualizerWiringHost) {}

  wire(api: VirtualizerApi): void {
    const viewport = this.host.viewport()
    if (viewport)
      this.spreader.spread(viewport, api.getViewportProps())
    const content = this.host.content()
    if (content)
      this.spreader.spread(content, api.getContentProps())

    // 条目是多实例 part，逐个打：身份取作者写的 value
    const next = new Set<number>()
    for (const el of this.host.items()) {
      const index = itemIndex(el)
      next.add(index)
      this.spreader.spread(el, api.getItemProps({ index }))
      api.registerItemElement(index, el)
      // 量尺寸放在这里而不是连接期：wire 跑在 updated 之后，此刻节点的布局才是这一帧的。
      // 每个外壳只交一次：内核量过即挂上自己的尺寸观察，之后的变化由它报。每轮接线都同步再量会强制布局，
      // 量出的变化又排一轮更新，正赶上尺寸观察的投递就成了 ResizeObserver 的循环，视口的尺寸通知被丢掉。
      // 窗口外的（宿主已收起）不量，下一轮露出来时再交
      if (wantsMeasure(el) && !this.measured.has(el) && virtualItemInWindow(api, el)) {
        this.measured.add(el)
        api.measureElement(el)
      }
    }
    for (const index of this.registered) {
      if (!next.has(index))
        api.registerItemElement(index, null)
    }
    this.registered.clear()
    for (const index of next) this.registered.add(index)
  }
}
