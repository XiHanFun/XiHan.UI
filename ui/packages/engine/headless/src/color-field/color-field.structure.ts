/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色输入框的标准结构：标题、盒里的色块、输入框与清空按钮、表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { colorFieldAnatomy } from './color-field.anatomy'
import type { ColorFieldApi } from './color-field.types'

type ColorFieldPart = (typeof colorFieldAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const COLOR_FIELD_STRUCTURE_PARTS = [
  'label',
  'control',
  'swatch',
  'input',
  'clear-trigger',
  'hidden-input',
] as const satisfies readonly ColorFieldPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const COLOR_FIELD_STRUCTURE_OMITS = [] as const satisfies readonly ColorFieldPart[]

type ColorFieldNode = StructureNode<(typeof COLOR_FIELD_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface ColorFieldStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 带不带表单影子：给了 name 才带，缺省不带。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/**
 * 颜色输入框在 root 里的标准结构，次序是标题、盒、表单影子。盒里依次是色块、输入框，
 * 开了 clearable 再铺清空按钮；给了 name 才铺表单影子。
 */
export function colorFieldStructure(model: Pick<ColorFieldApi, 'clearable'>, options: ColorFieldStructureOptions = {}): ColorFieldNode[] {
  const nodes: ColorFieldNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  const control: ColorFieldNode[] = [
    { key: 'swatch', tag: 'span', part: 'swatch' },
    { key: 'input', tag: 'input', part: 'input' },
  ]
  if (model.clearable)
    control.push({ key: 'clear-trigger', tag: 'button', part: 'clear-trigger' })
  nodes.push({ key: 'control', tag: 'div', part: 'control', children: control })
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
