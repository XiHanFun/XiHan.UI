/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标签输入框的标准结构：标题，盒里按当前值铺的标签、输入框与清空按钮，计数，表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { tagsInputAnatomy } from './tags-input.anatomy'
import type { TagsInputApi } from './tags-input.types'

type TagsInputPart = (typeof tagsInputAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TAGS_INPUT_STRUCTURE_PARTS = [
  'label',
  'control',
  'item',
  'item-input',
  'input',
  'clear-trigger',
  'count',
  'hidden-input',
] as const satisfies readonly TagsInputPart[]

/** anatomy 里不进标准结构的部件。 */
export const TAGS_INPUT_STRUCTURE_OMITS = [] as const satisfies readonly TagsInputPart[]

type TagsInputStructurePart = (typeof TAGS_INPUT_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：标签的常态部分、标签文本与删除钮，名字取元素委派声明里的。 */
type TagsInputTagPart = 'item-preview' | 'item-text' | 'item-delete-trigger'

type TagsInputNode = StructureNode<TagsInputStructurePart | TagsInputTagPart>

/** 结构里要不要铺这几个可选部件。 */
export interface TagsInputStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 开了就地编辑：每个标签里多一个常挂的编辑框，不编辑时由组件收起。 */
  editable?: boolean
  /** 作者给了哪些插槽的内容：label，以及按标签值带 key 的 item（标签文本）；没给插槽的标签文本就是它的值。 */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一个标签：常态部分（文本 + 删除钮），开了就地编辑时再带一个编辑框；带 slot 的文本的 data 是这个值。 */
function itemStructure(value: string, editable: boolean, slotted: StructureSlotted): TagsInputNode {
  const children: TagsInputNode[] = [{
    key: 'preview',
    tag: 'span',
    component: 'tag',
    part: 'item-preview',
    children: [
      slotted('item', value)
        ? { key: 'text', tag: 'span', component: 'tag', part: 'item-text', slot: { name: 'item', key: value }, data: value }
        : { key: 'text', tag: 'span', component: 'tag', part: 'item-text', text: value },
      { key: 'delete', tag: 'button', component: 'tag', part: 'item-delete-trigger' },
    ],
  }]
  if (editable)
    children.push({ key: 'input', tag: 'input', part: 'item-input' })
  return { key: `item:${value}`, tag: 'div', part: 'item', attrs: { value }, children }
}

/**
 * 标签输入框在 root 里的标准结构，次序是标题、盒、计数、表单影子。
 * 盒里先是按当前值铺的标签，再是输入框，最后是清空按钮（没东西可清时由组件收起）；开了 showCount 才铺计数。
 */
export function tagsInputStructure(model: Pick<TagsInputApi, 'value' | 'showCount'>, options: TagsInputStructureOptions = {}): TagsInputNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: TagsInputNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push({
    key: 'control',
    tag: 'div',
    part: 'control',
    children: [
      ...model.value.map(value => itemStructure(value, options.editable ?? false, slotted)),
      { key: 'input', tag: 'input', part: 'input' },
      { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' },
    ],
  })
  if (model.showCount)
    nodes.push({ key: 'count', tag: 'span', part: 'count' })
  nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
