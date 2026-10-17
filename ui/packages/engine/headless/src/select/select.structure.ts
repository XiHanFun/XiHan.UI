/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选择器的标准结构：按 collection 铺出整套部件树。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { selectAnatomy } from './select.anatomy'
import type { SelectApi, SelectNodeMeta } from './select.types'

type SelectPart = (typeof selectAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const SELECT_STRUCTURE_PARTS = [
  'hidden-select',
  'label',
  'control',
  'trigger',
  'value-text',
  'indicator',
  'clear-trigger',
  'tag-list',
  'positioner',
  'content',
  'list',
  'item',
  'item-prefix',
  'item-text',
  'item-description',
  'item-suffix',
  'item-indicator',
] as const satisfies readonly SelectPart[]

/** anatomy 里不进标准结构的部件：分组、底部操作区与空态、在途、取数失败的占位由作者手写结构时自己摆。 */
export const SELECT_STRUCTURE_OMITS = [
  'footer',
  'group',
  'group-label',
  'empty',
  'loading',
  'error',
  'retry-trigger',
] as const satisfies readonly SelectPart[]

type SelectStructurePart = (typeof SELECT_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：标签与 +N 那一枚，名字取元素委派声明里的。 */
type SelectTagPart = 'tag' | 'overflow-tag'

type SelectNode = StructureNode<SelectStructurePart | SelectTagPart>

/** 结构里要不要铺这几个可选部件。 */
export interface SelectStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 盒里带不带清空按钮，缺省不带。 */
  clearable?: boolean
  /**
   * 作者给了哪些插槽的内容：label、item（条目文字）、item-prefix、item-suffix，后三个按条目的值带 key。
   * 条目文字没给插槽时铺 collection 里的 label；行首、行尾没给插槽时不铺这两格。
   */
  slotted?: StructureSlotted
}

type SelectStructureModel = Pick<SelectApi, 'collection' | 'multiple' | 'tags' | 'isContentMounted'>

/** 一个条目：行首、文字、副文本、行尾、选中标记；带 slot 的格子的 data 是这一条的元信息。 */
function itemStructure(node: SelectNodeMeta, slotted: StructureSlotted): SelectNode {
  const children: SelectNode[] = []
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
 * 选择器在 root 里的标准结构，次序是表单影子、标题、盒、浮层。
 * 盒里触发器在前、清空按钮在后（按钮不能套按钮），展开箭头是触发器里的指示符；
 * 多选的已选项在触发器里排成标签（只作展示），摆不下的折进 +N；列表内容懒挂载、还没展开过时列表先空着。
 */
export function selectStructure(model: SelectStructureModel, options: SelectStructureOptions = {}): SelectNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const trigger: SelectNode = {
    key: 'trigger',
    tag: 'button',
    part: 'trigger',
    children: [
      { key: 'value-text', tag: 'span', part: 'value-text' },
      ...(model.multiple
        ? [{
          key: 'tag-list',
          tag: 'span',
          part: 'tag-list',
          children: [
            ...model.tags.map((tag): SelectNode => ({ key: `tag:${tag.value}`, tag: 'span', component: 'tag', part: 'tag', attrs: { value: tag.value }, text: tag.label })),
            { key: 'overflow-tag', tag: 'span', component: 'tag', part: 'overflow-tag' },
          ],
        } satisfies SelectNode]
        : []),
      { key: 'indicator', tag: 'span', part: 'indicator' },
    ],
  }
  const nodes: SelectNode[] = [{ key: 'hidden-select', tag: 'select', part: 'hidden-select' }]
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: options.clearable ? [trigger, { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' }] : [trigger],
    },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{
        key: 'content',
        tag: 'div',
        part: 'content',
        children: [{
          key: 'list',
          tag: 'div',
          part: 'list',
          children: model.isContentMounted() ? model.collection.map(node => itemStructure(node, slotted)) : [],
        }],
      }],
    },
  )
  return nodes
}
