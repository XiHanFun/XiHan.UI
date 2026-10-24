/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选择器的标准结构：按 collection 铺出整套部件树。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { StructureVirtualItem, VirtualStructurePart } from '../shared/virtual-structure'
import type { selectAnatomy } from './select.anatomy'
import type { SelectApi, SelectNodeMeta } from './select.types'
import { virtualListStructure } from '../shared/virtual-structure'

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
  'empty',
  'loading',
  'error',
  'retry-trigger',
] as const satisfies readonly SelectPart[]

/** anatomy 里不进标准结构的部件：分组与底部操作区由作者手写结构时自己摆。 */
export const SELECT_STRUCTURE_OMITS = [
  'footer',
  'group',
  'group-label',
] as const satisfies readonly SelectPart[]

type SelectStructurePart = (typeof SELECT_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：标签与 +N 那一枚，名字取元素委派声明里的。 */
type SelectTagPart = 'tag' | 'overflow-tag'

type SelectNode = StructureNode<SelectStructurePart | SelectTagPart | VirtualStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface SelectStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 盒里带不带清空按钮，缺省不带。 */
  clearable?: boolean
  /** 空态文字：给了就写进 empty，没给时取 translations.empty；empty 插槽有内容时内容归作者。 */
  empty?: string
  /**
   * 作者给了哪些插槽的内容：label、empty、item（条目文字）、item-prefix、item-suffix，后三个按条目的值带 key。
   * 条目文字没给插槽时铺 collection 里的 label；行首、行尾没给插槽时不铺这两格。
   */
  slotted?: StructureSlotted
  /**
   * 虚拟化窗口：给了即列表外套 Virtualizer 的视口与内容层，只铺窗口里的这几条（按下标取 collection），
   * 下标与 key 取自 Virtualizer 的 virtualItems；没给即铺全部条目。
   */
  virtualItems?: readonly StructureVirtualItem[]
}

type SelectStructureModel = Pick<SelectApi, 'collection' | 'multiple' | 'tags' | 'isContentMounted' | 'translations'>

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
 * 浮层里列表之后是空态、在途、取数失败的提示与重试钮，文字取 translations（空态先取 empty），露哪一种归连接层。
 * 给了 virtualItems 时列表包在 Virtualizer 的视口里，只铺窗口里的条目，见 virtualListStructure。
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
        children: [
          options.virtualItems
            ? virtualListStructure<SelectStructurePart | SelectTagPart>(
                { key: 'list', tag: 'div', part: 'list' },
                model.isContentMounted() ? options.virtualItems : [],
                (index) => {
                  const node = model.collection[index]
                  return node ? itemStructure(node, slotted) : null
                },
              )
            : {
                key: 'list',
                tag: 'div',
                part: 'list',
                children: model.isContentMounted() ? model.collection.map(node => itemStructure(node, slotted)) : [],
              },
          slotted('empty')
            ? { key: 'empty', tag: 'div', part: 'empty', slot: { name: 'empty' } }
            : { key: 'empty', tag: 'div', part: 'empty', text: options.empty ?? model.translations.empty },
          { key: 'loading', tag: 'div', part: 'loading', text: model.translations.loading },
          { key: 'error', tag: 'div', part: 'error', text: model.translations.loadError },
          { key: 'retry-trigger', tag: 'button', part: 'retry-trigger', text: model.translations.retry },
        ],
      }],
    },
  )
  return nodes
}
