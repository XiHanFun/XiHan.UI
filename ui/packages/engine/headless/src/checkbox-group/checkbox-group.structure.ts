/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 复选组的标准结构：三端不写结构时按它铺出整套部件，Web Components 不写部件时元素按它生成节点。

import type { PropTypes } from '@xihan-ui/core'
import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { checkboxGroupAnatomy } from './checkbox-group.anatomy'
import type { CheckboxGroupApi, CheckboxGroupNodeMeta } from './checkbox-group.types'

type CheckboxGroupPart = (typeof checkboxGroupAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const CHECKBOX_GROUP_STRUCTURE_PARTS = [
  'label',
  'item',
  'hidden-input',
  'indicator',
  'item-text',
  'item-description',
] as const satisfies readonly CheckboxGroupPart[]

/** anatomy 里不进标准结构的部件：全选格是可选部件，要用时作者手写结构。 */
export const CHECKBOX_GROUP_STRUCTURE_OMITS = [
  'select-all-trigger',
] as const satisfies readonly CheckboxGroupPart[]

type CheckboxGroupNode = StructureNode<(typeof CHECKBOX_GROUP_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface CheckboxGroupStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /**
   * 作者给了哪些插槽的内容：label，以及按条目的值带 key 的 item（条目文字）。
   * 条目文字没给插槽时铺 collection 里的 label。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一个条目：表单影子、方框、文字、说明（给了才铺）；带 slot 的文字格的 data 是这一条的元信息。 */
function itemStructure(node: CheckboxGroupNodeMeta<unknown>, slotted: StructureSlotted): CheckboxGroupNode {
  const children: CheckboxGroupNode[] = [
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
    { key: 'indicator', tag: 'span', part: 'indicator' },
    slotted('item', node.key)
      ? { key: 'text', tag: 'span', part: 'item-text', slot: { name: 'item', key: node.key }, data: node }
      : { key: 'text', tag: 'span', part: 'item-text', text: node.label },
  ]
  if (node.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: node.description })
  // 结构里一律用键：值可以是对象，拼不成节点的 key，也写不进 data-value；插槽数据 node 里照旧是原值
  return { key: `item:${node.key}`, tag: 'div', part: 'item', attrs: { value: node.key }, children }
}

/** 复选组在 root 里的标准结构：标题与 collection 的条目；每个条目里表单影子与方框在前，接着文字与说明。 */
// 值不论什么类型，结构只用元信息里的键：按 unknown 收，带具体值类型的 api 都交得进来
export function checkboxGroupStructure(model: Pick<CheckboxGroupApi<PropTypes, unknown>, 'collection'>, options: CheckboxGroupStructureOptions = {}): CheckboxGroupNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: CheckboxGroupNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(...model.collection.map(node => itemStructure(node, slotted)))
  return nodes
}
