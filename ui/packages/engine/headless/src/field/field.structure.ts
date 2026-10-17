/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 字段的标准结构：标题、作者给的控件、说明、错误文案。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { fieldAnatomy } from './field.anatomy'

type FieldPart = (typeof fieldAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const FIELD_STRUCTURE_PARTS = [
  'label',
  'description',
  'error-text',
] as const satisfies readonly FieldPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const FIELD_STRUCTURE_OMITS = [] as const satisfies readonly FieldPart[]

/** 由出口处的作者内容充当的部件：控件原样放进字段，库内控件顶替 control，原生控件要标 control 时手写结构。 */
export const FIELD_STRUCTURE_OUTLETS = [
  'control',
] as const satisfies readonly FieldPart[]

type FieldNode = StructureNode<(typeof FIELD_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几段。 */
export interface FieldStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 说明文字：给了就铺带这段文字的说明；description 插槽有内容时铺内容归作者的说明。 */
  description?: string
  /**
   * 错误文案：给了（空串也算）就铺错误文案，节点常挂、invalid 时显示；error-text 插槽有内容时内容归作者。
   * 空串时节点里不放文字，Vue / React 在表单里由字段自取该项的错误。
   */
  errorText?: string
  /** 作者给了哪些插槽的内容：label、control、description、error-text。 */
  slotted?: StructureSlotted
}

/**
 * 字段在 root 里的标准结构，次序是标题、控件、说明、错误文案。控件是作者内容的出口：作者给的控件原样放在
 * 标题之后，外面不包部件；标题、说明、错误文案给了文字或插槽内容才铺。
 */
export function fieldStructure(options: FieldStructureOptions = {}): StructureChild<(typeof FIELD_STRUCTURE_PARTS)[number]>[] {
  const slotted = (name: string): boolean => options.slotted?.(name) ?? false
  const nodes: StructureChild<(typeof FIELD_STRUCTURE_PARTS)[number]>[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push({ key: 'control', outlet: true, slot: { name: 'control' } })
  if (slotted('description'))
    nodes.push({ key: 'description', tag: 'p', part: 'description', slot: { name: 'description' } })
  else if (options.description != null)
    nodes.push({ key: 'description', tag: 'p', part: 'description', text: options.description })
  if (slotted('error-text')) {
    nodes.push({ key: 'error-text', tag: 'p', part: 'error-text', slot: { name: 'error-text' } })
  }
  else if (options.errorText != null) {
    const errorText: FieldNode = { key: 'error-text', tag: 'p', part: 'error-text' }
    nodes.push(options.errorText === '' ? errorText : { ...errorText, text: options.errorText })
  }
  return nodes
}
