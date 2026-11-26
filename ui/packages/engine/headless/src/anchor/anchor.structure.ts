/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 锚点目录的标准结构：按 collection 一条一个链接铺出目录。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { anchorAnatomy } from './anchor.anatomy'
import type { AnchorApi, AnchorNodeMeta } from './anchor.types'

type AnchorPart = (typeof anchorAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const ANCHOR_STRUCTURE_PARTS = [
  'list',
  'item',
  'link',
  'indicator',
] as const satisfies readonly AnchorPart[]

/** anatomy 里不进标准结构的部件：链接里另塞图标时才要文字层，作者手写结构时自己摆。 */
export const ANCHOR_STRUCTURE_OMITS = [
  'link-text',
] as const satisfies readonly AnchorPart[]

type AnchorNode = StructureNode<(typeof ANCHOR_STRUCTURE_PARTS)[number]>

/** 一条目录：li 里一条链接，写着目标区块的 id，文字是 label。 */
function itemStructure(meta: AnchorNodeMeta): AnchorNode {
  return {
    key: `item:${meta.value}`,
    tag: 'li',
    part: 'item',
    children: [{ key: 'link', tag: 'a', part: 'link', attrs: { value: meta.value }, text: meta.label }],
  }
}

/**
 * 锚点目录在 root（nav）里的标准结构：一个列表，collection 的每一条一个 li，末尾是滑动的指示条。
 * 只铺一层：嵌套目录手写结构。没有条目时什么都不铺。
 */
export function anchorStructure(model: Pick<AnchorApi, 'collection'>): AnchorNode[] {
  if (model.collection.length === 0)
    return []
  return [{
    key: 'list',
    tag: 'ul',
    part: 'list',
    children: [...model.collection.map(itemStructure), { key: 'indicator', tag: 'li', part: 'indicator' }],
  }]
}
