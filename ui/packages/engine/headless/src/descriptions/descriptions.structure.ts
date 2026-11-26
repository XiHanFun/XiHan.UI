/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 描述列表的标准结构：按 collection 一组一格铺出「标签 + 取值」。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { descriptionsAnatomy } from './descriptions.anatomy'
import type { DescriptionsApi, DescriptionsNodeMeta } from './descriptions.types'

type DescriptionsPart = (typeof descriptionsAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const DESCRIPTIONS_STRUCTURE_PARTS = [
  'item',
  'label',
  'value',
] as const satisfies readonly DescriptionsPart[]

/**
 * anatomy 里不进标准结构的部件：头部排在根之外（根是 dl，里面只能放成对的 dt / dd），
 * 结构只铺根里的子树；Vue 的 header 插槽、React 的 header 照常给，Web Components 要头部时手写结构。
 */
export const DESCRIPTIONS_STRUCTURE_OMITS = [
  'header',
  'title',
  'extra',
] as const satisfies readonly DescriptionsPart[]

type DescriptionsNode = StructureNode<(typeof DESCRIPTIONS_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几处作者内容。 */
export interface DescriptionsStructureOptions {
  /**
   * 作者给了哪些插槽的内容：value（这一格的取值），按条目的 value 带 key。
   * 没给插槽时取值铺 collection 里的 content。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一格：标签在前、取值在后；跨列数写在格子上，由连接层钳到列数以内。取值归作者时带 slot，data 是这一组的元信息。 */
function itemStructure(meta: DescriptionsNodeMeta, slotted: StructureSlotted): DescriptionsNode {
  const value: DescriptionsNode = slotted('value', meta.value)
    ? { key: 'value', tag: 'dd', part: 'value', slot: { name: 'value', key: meta.value }, data: meta }
    : { key: 'value', tag: 'dd', part: 'value', text: meta.content }
  const base = {
    key: `item:${meta.value}`,
    tag: 'div',
    part: 'item',
    children: [{ key: 'label', tag: 'dt', part: 'label', text: meta.label }, value],
  } as const
  return meta.span == null ? base : { ...base, attrs: { span: String(meta.span) } }
}

/** 描述列表在 root（dl）里的标准结构：collection 的每一组一格，按数据顺序排。 */
export function descriptionsStructure(model: Pick<DescriptionsApi, 'collection'>, options: DescriptionsStructureOptions = {}): DescriptionsNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  return model.collection.map(meta => itemStructure(meta, slotted))
}
