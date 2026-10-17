/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 卡片的标准结构：页头里的标题与说明、正文、页脚，给了哪段内容才铺哪段。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { cardAnatomy } from './card.anatomy'

type CardPart = (typeof cardAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const CARD_STRUCTURE_PARTS = [
  'header',
  'title',
  'description',
  'content',
  'footer',
] as const satisfies readonly CardPart[]

/** anatomy 里不进标准结构的部件：整卡可交互的触发器是带地址的链接或按钮，要用时作者手写结构。 */
export const CARD_STRUCTURE_OMITS = [
  'trigger',
] as const satisfies readonly CardPart[]

type CardNode = StructureNode<(typeof CARD_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几段。 */
export interface CardStructureOptions {
  /** 作者给了哪些插槽的内容：title、description、content、footer。 */
  slotted?: StructureSlotted
}

/**
 * 卡片在 root 里的标准结构，次序是页头、正文、页脚。给了标题或说明才铺页头（标题在前），
 * 给了正文才铺正文，给了页脚才铺页脚；每段的内容都归作者。
 */
export function cardStructure(options: CardStructureOptions = {}): CardNode[] {
  const slotted = (name: string): boolean => options.slotted?.(name) ?? false
  const nodes: CardNode[] = []
  const header: CardNode[] = []
  if (slotted('title'))
    header.push({ key: 'title', tag: 'h3', part: 'title', slot: { name: 'title' } })
  if (slotted('description'))
    header.push({ key: 'description', tag: 'p', part: 'description', slot: { name: 'description' } })
  if (header.length > 0)
    nodes.push({ key: 'header', tag: 'div', part: 'header', children: header })
  if (slotted('content'))
    nodes.push({ key: 'content', tag: 'div', part: 'content', slot: { name: 'content' } })
  if (slotted('footer'))
    nodes.push({ key: 'footer', tag: 'div', part: 'footer', slot: { name: 'footer' } })
  return nodes
}
