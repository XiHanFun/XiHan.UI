/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 空状态的标准结构：插画或图标、标题、说明、操作，给了哪段内容才铺哪段。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { emptyStateAnatomy } from './empty-state.anatomy'

type EmptyStatePart = (typeof emptyStateAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const EMPTY_STATE_STRUCTURE_PARTS = [
  'media',
  'indicator',
  'title',
  'description',
  'action',
] as const satisfies readonly EmptyStatePart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const EMPTY_STATE_STRUCTURE_OMITS = [] as const satisfies readonly EmptyStatePart[]

type EmptyStateNode = StructureNode<(typeof EMPTY_STATE_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几段。 */
export interface EmptyStateStructureOptions {
  /** 标题文字：给了就铺带这段文字的标题；title 插槽有内容时铺内容归作者的标题。 */
  title?: string
  /** 说明文字：给了就铺带这段文字的说明；description 插槽有内容时铺内容归作者的说明。 */
  description?: string
  /** 作者给了哪些插槽的内容：media、indicator、title、description、action。 */
  slotted?: StructureSlotted
}

/** 一段文字：插槽有内容时交给作者，否则写给的文字；两者都没有（或是空串）时这一段不铺。 */
function textPart(part: 'title' | 'description', text: string | undefined, slotted: StructureSlotted): EmptyStateNode | null {
  if (slotted(part))
    return { key: part, tag: 'p', part, slot: { name: part } }
  return text != null && text !== '' ? { key: part, tag: 'p', part, text } : null
}

/**
 * 空状态在 root 里的标准结构，次序是插画、图标、标题、说明、操作，与手写部件的文档序相同。
 * 插画与图标只来自插槽（二者通常只给一个），标题与说明取文字或同名插槽，操作区只来自插槽；
 * 给了哪段才铺哪段，什么都不给时 root 里是空的。
 */
export function emptyStateStructure(options: EmptyStateStructureOptions = {}): EmptyStateNode[] {
  const slotted: StructureSlotted = name => options.slotted?.(name) ?? false
  const nodes: EmptyStateNode[] = []
  if (slotted('media'))
    nodes.push({ key: 'media', tag: 'div', part: 'media', slot: { name: 'media' } })
  if (slotted('indicator'))
    nodes.push({ key: 'indicator', tag: 'span', part: 'indicator', slot: { name: 'indicator' } })
  for (const node of [textPart('title', options.title, slotted), textPart('description', options.description, slotted)]) {
    if (node)
      nodes.push(node)
  }
  if (slotted('action'))
    nodes.push({ key: 'action', tag: 'div', part: 'action', slot: { name: 'action' } })
  return nodes
}
