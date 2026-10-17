/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文本框的标准结构：标题、盒里的单行输入框与清空按钮、字数。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { textFieldAnatomy } from './text-field.anatomy'
import type { TextFieldApi } from './text-field.types'

type TextFieldPart = (typeof textFieldAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TEXT_FIELD_STRUCTURE_PARTS = [
  'label',
  'control',
  'input',
  'clear-trigger',
  'count',
] as const satisfies readonly TextFieldPart[]

/** anatomy 里不进标准结构的部件：输入框前后的装饰段由作者手写结构时自己摆。 */
export const TEXT_FIELD_STRUCTURE_OMITS = [
  'prefix',
  'suffix',
] as const satisfies readonly TextFieldPart[]

type TextFieldNode = StructureNode<(typeof TEXT_FIELD_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface TextFieldStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/**
 * 文本框在 root 里的标准结构，次序是标题、盒、字数。输入框是单行的 input；多行宿主要写 textarea，作者手写结构。
 * 开了 clearable 才在盒里铺清空按钮，开了 showCount 才铺字数（文字由组件按「已用 / 上限」填）。
 */
export function textFieldStructure(model: Pick<TextFieldApi, 'clearable' | 'showCount'>, options: TextFieldStructureOptions = {}): TextFieldNode[] {
  const nodes: TextFieldNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  const control: TextFieldNode[] = [{ key: 'input', tag: 'input', part: 'input' }]
  if (model.clearable)
    control.push({ key: 'clear-trigger', tag: 'button', part: 'clear-trigger' })
  nodes.push({ key: 'control', tag: 'div', part: 'control', children: control })
  if (model.showCount)
    nodes.push({ key: 'count', tag: 'span', part: 'count' })
  return nodes
}
