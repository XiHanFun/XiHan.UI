/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 字段组的标准结构：组标题、说明、字段区、错误文案、按钮行，组标题恒在、其余给了内容才铺。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { fieldsetAnatomy } from './fieldset.anatomy'

type FieldsetPart = (typeof fieldsetAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const FIELDSET_STRUCTURE_PARTS = [
  'legend',
  'description',
  'field-group',
  'error-text',
  'actions',
] as const satisfies readonly FieldsetPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const FIELDSET_STRUCTURE_OMITS = [] as const satisfies readonly FieldsetPart[]

type FieldsetNode = StructureNode<(typeof FIELDSET_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几段。 */
export interface FieldsetStructureOptions {
  /** 组标题文字；legend 插槽有内容时铺内容归作者的 legend。 */
  legend?: string
  /** 作者给了哪些插槽的内容：legend、description、field-group、error-text、actions。 */
  slotted?: StructureSlotted
}

/**
 * 字段组在 root（原生 fieldset）里的标准结构，次序是组标题、说明、字段区、错误文案、按钮行。
 * 组标题恒铺且排在最前（原生 legend 只有作为首个子节点才给这一组起名）；其余各段给了内容才铺，内容都归作者。
 * 字段放进 field-group：宽度够时并排分栏，只放一个容器时它占满整行。
 */
export function fieldsetStructure(options: FieldsetStructureOptions = {}): FieldsetNode[] {
  const slotted = (name: string): boolean => options.slotted?.(name) ?? false
  const legend: FieldsetNode = { key: 'legend', tag: 'legend', part: 'legend' }
  const nodes: FieldsetNode[] = [
    slotted('legend')
      ? { ...legend, slot: { name: 'legend' } }
      : options.legend != null ? { ...legend, text: options.legend } : legend,
  ]
  if (slotted('description'))
    nodes.push({ key: 'description', tag: 'p', part: 'description', slot: { name: 'description' } })
  if (slotted('field-group'))
    nodes.push({ key: 'field-group', tag: 'div', part: 'field-group', slot: { name: 'field-group' } })
  if (slotted('error-text'))
    nodes.push({ key: 'error-text', tag: 'p', part: 'error-text', slot: { name: 'error-text' } })
  if (slotted('actions'))
    nodes.push({ key: 'actions', tag: 'div', part: 'actions', slot: { name: 'actions' } })
  return nodes
}
