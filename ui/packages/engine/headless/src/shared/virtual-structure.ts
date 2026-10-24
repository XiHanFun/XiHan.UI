/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标准结构里的虚拟化列表：集合组件开了 virtual 时，列表外套 Virtualizer 的视口与内容层，只铺窗口里的那几条。
//
// 三个部件委派给 virtualizer：作者名带 virtual- 前缀，避开宿主自己的 content / item；接线后 data-scope 是 virtualizer，
// data-part 是 viewport / content / item。视口是滚动面，列表只是视口里的一层（皮肤据此让列表不再自己滚）。

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

/**
 * 把列表本体包进 Virtualizer：视口 > 列表 > 内容层 > 每个窗口下标一个外壳 > 宿主自己的条目。
 * item 按下标取条目节点，取不到（下标越界：collection 刚变短、窗口还没重排）的那条不铺。
 */
export function virtualListStructure<P extends string>(
  list: Omit<StructureNode<P>, 'children'>,
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
  return {
    key: 'virtual-viewport',
    tag: 'div',
    component: VIRTUAL_STRUCTURE_DELEGATE.name,
    part: 'virtual-viewport',
    children: [{
      ...list,
      children: [{ key: 'virtual-content', tag: 'div', component: VIRTUAL_STRUCTURE_DELEGATE.name, part: 'virtual-content', children: shells }],
    }],
  }
}
