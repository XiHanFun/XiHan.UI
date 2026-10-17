/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 评分的标准结构：标题、星星带里每档一颗星、表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { ratingAnatomy } from './rating.anatomy'
import type { RatingApi } from './rating.types'

type RatingPart = (typeof ratingAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const RATING_STRUCTURE_PARTS = [
  'label',
  'control',
  'item',
  'hidden-input',
] as const satisfies readonly RatingPart[]

/** anatomy 里不进标准结构的部件：星星带旁的分值文本，要用时作者手写结构。 */
export const RATING_STRUCTURE_OMITS = [
  'value-text',
] as const satisfies readonly RatingPart[]

type RatingNode = StructureNode<(typeof RATING_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface RatingStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 带不带表单影子：给了 name 才带，缺省不带。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/** 评分在 root 里的标准结构，次序是标题、星星带（每档一颗星，按档位带 key 与 value）、表单影子。 */
export function ratingStructure(model: Pick<RatingApi, 'items'>, options: RatingStructureOptions = {}): RatingNode[] {
  const nodes: RatingNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push({
    key: 'control',
    tag: 'div',
    part: 'control',
    children: model.items.map((value): RatingNode => ({ key: `item:${value}`, tag: 'span', part: 'item', attrs: { value: String(value) } })),
  })
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
