/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 数字输入框的标准结构：标题，盒里减号、输入框、加号。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { numberFieldAnatomy } from './number-field.anatomy'

type NumberFieldPart = (typeof numberFieldAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const NUMBER_FIELD_STRUCTURE_PARTS = [
  'label',
  'control',
  'decrement-trigger',
  'input',
  'increment-trigger',
] as const satisfies readonly NumberFieldPart[]

/** anatomy 里不进标准结构的部件：输入框前后的单位、货币符由作者手写结构时自己摆。 */
export const NUMBER_FIELD_STRUCTURE_OMITS = [
  'prefix',
  'suffix',
] as const satisfies readonly NumberFieldPart[]

type NumberFieldNode = StructureNode<(typeof NUMBER_FIELD_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface NumberFieldStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/** 数字输入框在 root 里的标准结构，次序是标题、盒；盒里减号在前、加号在后，夹着输入框。 */
export function numberFieldStructure(options: NumberFieldStructureOptions = {}): NumberFieldNode[] {
  const nodes: NumberFieldNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push({
    key: 'control',
    tag: 'div',
    part: 'control',
    children: [
      { key: 'decrement-trigger', tag: 'button', part: 'decrement-trigger' },
      { key: 'input', tag: 'input', part: 'input' },
      { key: 'increment-trigger', tag: 'button', part: 'increment-trigger' },
    ],
  })
  return nodes
}
