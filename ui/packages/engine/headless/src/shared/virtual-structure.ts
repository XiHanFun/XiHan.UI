/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构里的虚拟化列表：集合组件开了 virtual 时，列表外套 Virtualizer 的视口与内容层，只铺窗口里的那几条。
//
// 三个部件委派给 virtualizer：作者名带 virtual- 前缀，避开宿主自己的 content / item；接线后 data-scope 是 virtualizer，
// data-part 是 viewport / content / item。视口是滚动面，列表只是视口里的一层（皮肤据此让列表不再自己滚）。

import type { CollectionVirtualizer } from '../virtualizer/virtualizer.types'
import type { StructureChild, StructureNode } from './structure'

/** 委派给 virtualizer 的三个部件的作者名。 */
export type VirtualStructurePart = 'virtual-viewport' | 'virtual-content' | 'virtual-item'

/** 委派声明：元素的 partContract.delegates 与标准结构里的 component 都取这一份。 */
export const VIRTUAL_STRUCTURE_DELEGATE = {
  name: 'virtualizer',
  parts: ['virtual-viewport', 'virtual-content', 'virtual-item'],
} as const

/** 窗口里的一条：下标与稳定 key，取自 Virtualizer 的 virtualItems。 */
export interface StructureVirtualItem {
  readonly index: number
  readonly key: string | number
}

/** 内容层：每个窗口下标一个外壳，外壳里是宿主自己的条目；取不到条目（下标越界：数据刚变短、窗口还没重排）的那条不铺。 */
function virtualContent<P extends string>(
  items: readonly StructureVirtualItem[],
  item: (index: number) => StructureChild<P | VirtualStructurePart> | null,
): StructureNode<P | VirtualStructurePart> {
  const shells = items.flatMap((virtualItem): StructureNode<P | VirtualStructurePart>[] => {
    const node = item(virtualItem.index)
    if (!node)
      return []
    return [{
      key: `virtual-item:${virtualItem.key}`,
      tag: 'div',
      component: VIRTUAL_STRUCTURE_DELEGATE.name,
      part: 'virtual-item',
      // 条目高度不一（带副文本的两行）：渲出后按实测校正。值写成属性名本身，三端都读作开：
      // Vue 的布尔 prop 认它、React 拿到非空串、Web Components 只把 'false' 当关
      attrs: { value: String(virtualItem.index), measure: 'measure' },
      children: [node],
    }]
  })
  return { key: 'virtual-content', tag: 'div', component: VIRTUAL_STRUCTURE_DELEGATE.name, part: 'virtual-content', children: shells }
}

/**
 * 把列表本体包进 Virtualizer：视口 > 列表 > 内容层 > 每个窗口下标一个外壳 > 宿主自己的条目。
 * item 按下标取条目节点，取不到的那条不铺。
 */
export function virtualListStructure<P extends string>(
  list: Omit<StructureNode<P>, 'children'>,
  items: readonly StructureVirtualItem[],
  item: (index: number) => StructureChild<P | VirtualStructurePart> | null,
): StructureNode<P | VirtualStructurePart> {
  return {
    key: 'virtual-viewport',
    tag: 'div',
    component: VIRTUAL_STRUCTURE_DELEGATE.name,
    part: 'virtual-viewport',
    children: [{ ...list, children: [virtualContent(items, item)] }],
  }
}

/**
 * 只铺 Virtualizer 自己那一段：视口 > 内容层 > 外壳 > 宿主的条目。放进宿主已有的容器里用，
 * 容器在视口之外：表格的表体是行组，视口与外壳都在它里面，滚的是表格根节点。
 */
export function virtualWindowStructure<P extends string>(
  items: readonly StructureVirtualItem[],
  item: (index: number) => StructureChild<P | VirtualStructurePart> | null,
): StructureNode<P | VirtualStructurePart> {
  return {
    key: 'virtual-viewport',
    tag: 'div',
    component: VIRTUAL_STRUCTURE_DELEGATE.name,
    part: 'virtual-viewport',
    children: [virtualContent(items, item)],
  }
}

/**
 * 转交桥：宿主交给自己机器的那条桥。它是一个不变的对象，只在被读、被调的那一刻才去取 Virtualizer 交出的真桥。
 * 宿主求自己的 props 时不碰 Virtualizer 的 api——表格的条数要经宿主自己的数据管线算，宿主的 props 又要带上桥，
 * 直接取真桥会在同一轮求值里绕回自己（Vue 的 computed 拿到 undefined，Web Components 无限递归）。
 * 真桥还没到时条数为 0、其余操作都是空操作。
 */
export function forwardCollectionVirtualizer(target: () => CollectionVirtualizer | null | undefined): CollectionVirtualizer {
  return {
    get count() {
      return target()?.count ?? 0
    },
    scrollToIndex: (index, options) => target()?.scrollToIndex(index, options),
    focusIndex: (index, options) => target()?.focusIndex(index, options),
    getRenderedItemRoots: () => target()?.getRenderedItemRoots() ?? [],
    get scrollContainer() {
      return target()?.scrollContainer
    },
    getViewportElement: () => target()?.getViewportElement() ?? null,
    getContentElement: () => target()?.getContentElement?.() ?? null,
  }
}
