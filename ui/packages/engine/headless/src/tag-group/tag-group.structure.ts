/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标签组的标准结构：标题与按 collection 铺的一排标签。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { tagGroupAnatomy } from './tag-group.anatomy'
import type { TagGroupApi, TagGroupNodeMeta } from './tag-group.types'

type TagGroupPart = (typeof tagGroupAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TAG_GROUP_STRUCTURE_PARTS = [
  'label',
  'list',
  'cell',
  'item-indicator',
] as const satisfies readonly TagGroupPart[]

/** anatomy 里不进标准结构的部件。 */
export const TAG_GROUP_STRUCTURE_OMITS = [] as const satisfies readonly TagGroupPart[]

type TagGroupStructurePart = (typeof TAG_GROUP_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：标签本身、标签文字与摘除钮，名字取元素委派声明里的。 */
type TagGroupTagPart = 'item' | 'item-text' | 'item-delete-trigger'

type TagGroupStructureNode = StructureNode<TagGroupStructurePart | TagGroupTagPart>

/** 结构里要不要铺这几个可选部件。 */
export interface TagGroupStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /**
   * 作者给了哪些插槽的内容：label、item（标签文字，按标签的值带 key）。
   * 标签文字没给插槽时铺 collection 里的 label。
   */
  slotted?: StructureSlotted
}

type TagGroupStructureModel = Pick<TagGroupApi, 'collection'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一枚标签：格子里是文字、选中标记与摘除钮；摘除钮收不收起归连接层。带 slot 的格子的 data 是这一枚的元信息。 */
function itemStructure(node: TagGroupNodeMeta, slotted: StructureSlotted): TagGroupStructureNode {
  const text: TagGroupStructureNode = slotted('item', node.value)
    ? { key: 'text', tag: 'span', component: 'tag', part: 'item-text', slot: { name: 'item', key: node.value }, data: node }
    : { key: 'text', tag: 'span', component: 'tag', part: 'item-text', text: node.label }
  return {
    key: `item:${node.value}`,
    tag: 'span',
    component: 'tag',
    part: 'item',
    attrs: { value: node.value },
    children: [{
      key: 'cell',
      tag: 'span',
      part: 'cell',
      children: [
        text,
        { key: 'indicator', tag: 'span', part: 'item-indicator' },
        { key: 'delete-trigger', tag: 'button', component: 'tag', part: 'item-delete-trigger' },
      ],
    }],
  }
}

/** 标签组在 root 里的标准结构，次序是标题、标签列表；列表里每条数据一枚标签，没给 collection 时列表是空的。 */
export function tagGroupStructure(model: TagGroupStructureModel, options: TagGroupStructureOptions = {}): TagGroupStructureNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: TagGroupStructureNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push({ key: 'list', tag: 'div', part: 'list', children: model.collection.map(node => itemStructure(node, slotted)) })
  return nodes
}
