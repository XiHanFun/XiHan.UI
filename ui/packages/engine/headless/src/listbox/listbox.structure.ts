/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 列表框的标准结构：标题与按 collection 铺的条目。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { listboxAnatomy } from './listbox.anatomy'
import type { ListboxApi, ListboxNodeMeta } from './listbox.types'

type ListboxPart = (typeof listboxAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const LISTBOX_STRUCTURE_PARTS = [
  'label',
  'content',
  'item',
  'item-prefix',
  'item-text',
  'item-description',
  'item-suffix',
  'item-indicator',
] as const satisfies readonly ListboxPart[]

/** anatomy 里不进标准结构的部件：分组、空态、在途与取下一页的按钮由作者手写结构时自己摆。 */
export const LISTBOX_STRUCTURE_OMITS = [
  'group',
  'group-label',
  'empty',
  'loading',
  'load-more-trigger',
] as const satisfies readonly ListboxPart[]

type ListboxStructurePart = (typeof LISTBOX_STRUCTURE_PARTS)[number]

type ListboxNode = StructureNode<ListboxStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface ListboxStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /**
   * 作者给了哪些插槽的内容：label、item（条目文字）、item-prefix、item-suffix，后三个按条目的值带 key。
   * 条目文字没给插槽时铺 collection 里的 label；行首、行尾没给插槽时不铺这两格。
   */
  slotted?: StructureSlotted
}

type ListboxStructureModel = Pick<ListboxApi, 'collection'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一个条目：行首、文字、副文本、行尾、选中标记；带 slot 的格子的 data 是这一条的元信息。 */
function itemStructure(node: ListboxNodeMeta, slotted: StructureSlotted): ListboxNode {
  const children: ListboxNode[] = []
  if (slotted('item-prefix', node.value))
    children.push({ key: 'prefix', tag: 'span', part: 'item-prefix', slot: { name: 'item-prefix', key: node.value }, data: node })
  children.push(slotted('item', node.value)
    ? { key: 'text', tag: 'span', part: 'item-text', slot: { name: 'item', key: node.value }, data: node }
    : { key: 'text', tag: 'span', part: 'item-text', text: node.label })
  if (node.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: node.description })
  if (slotted('item-suffix', node.value))
    children.push({ key: 'suffix', tag: 'span', part: 'item-suffix', slot: { name: 'item-suffix', key: node.value }, data: node })
  children.push({ key: 'indicator', tag: 'span', part: 'item-indicator' })
  return { key: `item:${node.value}`, tag: 'div', part: 'item', attrs: { value: node.value }, children }
}

/** 列表框在 root 里的标准结构，次序是标题、列表；列表里每条数据一个条目，没给 collection 时列表是空的。 */
export function listboxStructure(model: ListboxStructureModel, options: ListboxStructureOptions = {}): ListboxNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: ListboxNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push({ key: 'content', tag: 'div', part: 'content', children: model.collection.map(node => itemStructure(node, slotted)) })
  return nodes
}
