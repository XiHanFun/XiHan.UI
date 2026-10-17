/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 开关组的标准结构：按 collection 铺出条目，末尾一份表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { toggleGroupAnatomy } from './toggle-group.anatomy'
import type { ToggleGroupApi } from './toggle-group.types'

type ToggleGroupPart = (typeof toggleGroupAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TOGGLE_GROUP_STRUCTURE_PARTS = [
  'item',
  'hidden-input',
] as const satisfies readonly ToggleGroupPart[]

/** anatomy 里不进标准结构的部件。 */
export const TOGGLE_GROUP_STRUCTURE_OMITS = [] as const satisfies readonly ToggleGroupPart[]

type ToggleGroupNode = StructureNode<(typeof TOGGLE_GROUP_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface ToggleGroupStructureOptions {
  /** 作者给了哪些条目的内容（插槽 item，按条目的值带 key）；没给的条目铺 collection 里的 label。 */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 开关组在 root 里的标准结构：每个条目一个原生按钮，文字直接落在按钮里；末尾一份表单影子，给了 name 才参与提交。
 * 带 slot 的条目的 data 是这一条的元信息。相邻条目间的分隔线由适配器按 separators 生成，不在结构里。
 */
export function toggleGroupStructure(model: Pick<ToggleGroupApi, 'collection'>, options: ToggleGroupStructureOptions = {}): ToggleGroupNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  return [
    ...model.collection.map((node): ToggleGroupNode => slotted('item', node.value)
      ? { key: `item:${node.value}`, tag: 'button', part: 'item', attrs: { value: node.value }, slot: { name: 'item', key: node.value }, data: node }
      : { key: `item:${node.value}`, tag: 'button', part: 'item', attrs: { value: node.value }, text: node.label }),
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
  ]
}
