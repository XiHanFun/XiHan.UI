/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组合框的标准结构：按 collection 铺出整套部件树。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { comboboxAnatomy } from './combobox.anatomy'
import type { ComboboxApi, ComboboxNodeMeta } from './combobox.types'

type ComboboxPart = (typeof comboboxAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const COMBOBOX_STRUCTURE_PARTS = [
  'label',
  'control',
  'tag-list',
  'input',
  'clear-trigger',
  'trigger',
  'positioner',
  'content',
  'item',
  'item-prefix',
  'item-text',
  'item-description',
  'item-suffix',
  'item-indicator',
  'empty',
  'loading',
  'hidden-input',
] as const satisfies readonly ComboboxPart[]

/** anatomy 里不进标准结构的部件：分组由作者手写结构时自己摆。 */
export const COMBOBOX_STRUCTURE_OMITS = [
  'group',
  'group-label',
] as const satisfies readonly ComboboxPart[]

type ComboboxStructurePart = (typeof COMBOBOX_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：标签、标签文字、标签里的删除钮与 +N 那一枚，名字取元素委派声明里的。 */
type ComboboxTagPart = 'tag' | 'tag-label' | 'item-delete-trigger' | 'overflow-tag'

type ComboboxNode = StructureNode<ComboboxStructurePart | ComboboxTagPart>

/** 结构里要不要铺这几个可选部件。 */
export interface ComboboxStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 空态文字：给了就写进 empty；empty 插槽有内容时内容归作者。empty 部件总是铺，收放归连接层。 */
  empty?: string
  /** 盒里带不带清空按钮，缺省不带。 */
  clearable?: boolean
  /**
   * 作者给了哪些插槽的内容：label、empty、item（条目文字）、item-prefix、item-suffix，后三个按条目的值带 key。
   * 条目文字没给插槽时铺 collection 里的 label；行首、行尾没给插槽时不铺这两格。
   */
  slotted?: StructureSlotted
}

type ComboboxStructureModel = Pick<ComboboxApi, 'collection' | 'multiple' | 'tags' | 'translations'>

/** 一个条目：行首、文字、副文本、行尾、选中标记；带 slot 的格子的 data 是这一条的元信息。 */
function itemStructure(node: ComboboxNodeMeta, slotted: StructureSlotted): ComboboxNode {
  const children: ComboboxNode[] = []
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

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 组合框在 root 里的标准结构，次序是标题、盒、浮层、表单影子。
 * 盒里多选的已选项排在输入框之前，一枚一个带删除钮的标签，摆不下的折进 +N；清空钮在输入框之后、展开钮之前。
 * 浮层里候选列表之后是空态节点（content 的兄弟，不进列表框）。过滤仍归调用方：collection 就是当前应显示的候选。
 */
export function comboboxStructure(model: ComboboxStructureModel, options: ComboboxStructureOptions = {}): ComboboxNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const control: ComboboxNode[] = []
  if (model.multiple) {
    control.push({
      key: 'tag-list',
      tag: 'span',
      part: 'tag-list',
      children: [
        ...model.tags.map((tag): ComboboxNode => ({
          key: `tag:${tag.value}`,
          tag: 'span',
          component: 'tag',
          part: 'tag',
          attrs: { value: tag.value },
          children: [
            { key: 'label', tag: 'span', component: 'tag', part: 'tag-label', text: tag.label },
            { key: 'delete', tag: 'button', component: 'tag', part: 'item-delete-trigger' },
          ],
        })),
        { key: 'overflow-tag', tag: 'span', component: 'tag', part: 'overflow-tag' },
      ],
    })
  }
  control.push({ key: 'input', tag: 'input', part: 'input' })
  if (options.clearable)
    control.push({ key: 'clear-trigger', tag: 'button', part: 'clear-trigger' })
  control.push({ key: 'trigger', tag: 'button', part: 'trigger' })

  const nodes: ComboboxNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push(
    { key: 'control', tag: 'div', part: 'control', children: control },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [
        { key: 'content', tag: 'div', part: 'content', children: model.collection.map(node => itemStructure(node, slotted)) },
        slotted('empty')
          ? { key: 'empty', tag: 'div', part: 'empty', slot: { name: 'empty' } }
          : { key: 'empty', tag: 'div', part: 'empty', ...(options.empty == null ? {} : { text: options.empty }) },
        { key: 'loading', tag: 'div', part: 'loading', text: model.translations.loading },
      ],
    },
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
  )
  return nodes
}
