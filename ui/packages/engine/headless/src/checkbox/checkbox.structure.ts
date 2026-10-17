/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 复选框的标准结构：方框（root）里的勾选标记，给了 name 时再带一份表单影子。
// Vue / React 的 XhCheckbox 渲方框里面这一段、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { checkboxAnatomy } from './checkbox.anatomy'

type CheckboxPart = (typeof checkboxAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const CHECKBOX_STRUCTURE_PARTS = [
  'indicator',
  'hidden-input',
] as const satisfies readonly CheckboxPart[]

/**
 * anatomy 里不进标准结构的部件：带文字时 label 包住 root 与 text，是 root 的外层，不在 root 的子树里。
 * Vue / React 给了文字时自己包；Web Components 要带文字时作者手写这三个部件。
 */
export const CHECKBOX_STRUCTURE_OMITS = [
  'label',
  'text',
] as const satisfies readonly CheckboxPart[]

type CheckboxNode = StructureNode<(typeof CHECKBOX_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface CheckboxStructureOptions {
  /** 带不带表单影子：给了 name 才带，缺省不带。type=hidden 不是交互内容，放在按钮里是合法的。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容：indicator（方框里的图形）。没给时勾选标记由皮肤画。 */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 复选框在 root（方框按钮）里的标准结构：勾选标记，以及可选的表单影子。 */
export function checkboxStructure(options: CheckboxStructureOptions = {}): CheckboxNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: CheckboxNode[] = [
    slotted('indicator')
      ? { key: 'indicator', tag: 'span', part: 'indicator', slot: { name: 'indicator' } }
      : { key: 'indicator', tag: 'span', part: 'indicator' },
  ]
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
