/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 单选组的标准结构：三端不写结构时按它铺出整套部件，Web Components 不写部件时元素按它生成节点。

import type { PropTypes } from '@xihan-ui/core'
import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { radioGroupAnatomy } from './radio-group.anatomy'
import type { RadioGroupApi, RadioGroupNodeMeta } from './radio-group.types'

type RadioGroupPart = (typeof radioGroupAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const RADIO_GROUP_STRUCTURE_PARTS = [
  'label',
  'thumb',
  'item',
  'hidden-input',
  'indicator',
  'item-icon',
  'item-text',
  'item-description',
] as const satisfies readonly RadioGroupPart[]

/** anatomy 里不进标准结构的部件。 */
export const RADIO_GROUP_STRUCTURE_OMITS = [] as const satisfies readonly RadioGroupPart[]

type RadioGroupNode = StructureNode<(typeof RADIO_GROUP_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface RadioGroupStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /**
   * 作者给了哪些插槽的内容：label，以及按条目的值带 key 的 item（条目文字）。
   * 条目文字没给插槽时铺 collection 里的 label。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一个条目：表单影子、单选圆圈、图标（给了才铺）、文字、说明（给了才铺）；带 slot 的文字格的 data 是这一条的元信息。 */
function itemStructure(node: RadioGroupNodeMeta<unknown>, slotted: StructureSlotted): RadioGroupNode {
  const children: RadioGroupNode[] = [
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
    { key: 'indicator', tag: 'span', part: 'indicator' },
  ]
  if (node.icon != null)
    children.push({ key: 'icon', tag: 'span', part: 'item-icon', text: node.icon })
  children.push(slotted('item', node.key)
    ? { key: 'text', tag: 'span', part: 'item-text', slot: { name: 'item', key: node.key }, data: node }
    : { key: 'text', tag: 'span', part: 'item-text', text: node.label })
  if (node.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: node.description })
  // 结构里一律用键：值可以是对象，拼不成节点的 key，也写不进 data-value；插槽数据 node 里照旧是原值
  return { key: `item:${node.key}`, tag: 'div', part: 'item', attrs: { value: node.key }, children }
}

/**
 * 单选组在 root 里的标准结构：标题、segmented 形态的滑块（绝对定位，排在条目之前，后面的条目才盖得住它）、
 * collection 的条目。每个条目里表单影子与单选圆圈在前，接着图标、文字与说明。
 */
// 值不论什么类型，结构只用元信息里的键：按 unknown 收，带具体值类型的 api 都交得进来
export function radioGroupStructure(model: Pick<RadioGroupApi<PropTypes, unknown>, 'collection' | 'variant'>, options: RadioGroupStructureOptions = {}): RadioGroupNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: RadioGroupNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  if (model.variant === 'segmented')
    nodes.push({ key: 'thumb', tag: 'span', part: 'thumb' })
  nodes.push(...model.collection.map(node => itemStructure(node, slotted)))
  return nodes
}
