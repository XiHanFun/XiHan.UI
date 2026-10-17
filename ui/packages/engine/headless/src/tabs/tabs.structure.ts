/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标签页的标准结构：按 collection 铺出标签带与面板。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { tabsAnatomy } from './tabs.anatomy'
import type { TabsApi, TabsNodeMeta } from './tabs.types'

type TabsPart = (typeof tabsAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TABS_STRUCTURE_PARTS = [
  'list',
  'trigger',
  'close-trigger',
  'content',
] as const satisfies readonly TabsPart[]

/**
 * anatomy 里不进标准结构的部件：滑条、分隔线、翻页钮、「更多」钮、拖拽把手与播报区由作者手写结构时自己摆。
 */
export const TABS_STRUCTURE_OMITS = [
  'indicator',
  'separator',
  'prev-trigger',
  'next-trigger',
  'overflow-trigger',
  'tab-drag-trigger',
  'live-region',
] as const satisfies readonly TabsPart[]

type TabsNode = StructureNode<(typeof TABS_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface TabsStructureOptions {
  /** 每个标签后面跟不跟一枚关闭钮，缺省不跟。 */
  closable?: boolean
  /**
   * 作者给了哪些插槽的内容：panel（面板内容），按条目的值带 key。
   * 面板没给插槽时是空面板。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一块面板：内容归作者时带 slot，data 是这一条的元信息；没给内容时是空面板。 */
function panelStructure(node: TabsNodeMeta, slotted: StructureSlotted): TabsNode {
  return slotted('panel', node.value)
    ? { key: `content:${node.value}`, tag: 'div', part: 'content', attrs: { value: node.value }, slot: { name: 'panel', key: node.value }, data: node }
    : { key: `content:${node.value}`, tag: 'div', part: 'content', attrs: { value: node.value } }
}

/**
 * 标签页在 root 里的标准结构：先是标签带，每条一个标签（文字取 label），可关闭时标签后面紧跟它的关闭钮；
 * 再是每条一块面板，按 collection 的先后排。没有条目时什么都不铺：空的标签带会白占一个 Tab 位。
 */
export function tabsStructure(model: Pick<TabsApi, 'collection'>, options: TabsStructureOptions = {}): TabsNode[] {
  if (model.collection.length === 0)
    return []
  const slotted = options.slotted ?? NOTHING_SLOTTED
  return [
    {
      key: 'list',
      tag: 'div',
      part: 'list',
      children: model.collection.flatMap((node): TabsNode[] => [
        { key: `trigger:${node.value}`, tag: 'button', part: 'trigger', attrs: { value: node.value }, text: node.label },
        ...(options.closable ? [{ key: `close-trigger:${node.value}`, tag: 'button', part: 'close-trigger', attrs: { value: node.value } } satisfies TabsNode] : []),
      ]),
    },
    ...model.collection.map(node => panelStructure(node, slotted)),
  ]
}
