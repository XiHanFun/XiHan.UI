/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分隔的标准结构：给了分节文字时是线、文字、线三段，没给时 root 自己就是那条线。
// Vue / React 的 XhSeparator、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { separatorAnatomy } from './separator.anatomy'

type SeparatorPart = (typeof separatorAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const SEPARATOR_STRUCTURE_PARTS = [
  'line',
  'content',
] as const satisfies readonly SeparatorPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const SEPARATOR_STRUCTURE_OMITS = [] as const satisfies readonly SeparatorPart[]

type SeparatorNode = StructureNode<(typeof SEPARATOR_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺分节文字。 */
export interface SeparatorStructureOptions {
  /** 作者给了哪些插槽的内容：只有 content（分节文字）。 */
  slotted?: StructureSlotted
}

/** 分隔在 root 里的标准结构：content 插槽有内容时铺线、文字、线三段，否则什么都不铺，root 即是那条线。 */
export function separatorStructure(options: SeparatorStructureOptions = {}): SeparatorNode[] {
  if (!options.slotted?.('content'))
    return []
  return [
    { key: 'line:start', tag: 'div', part: 'line' },
    { key: 'content', tag: 'span', part: 'content', slot: { name: 'content' } },
    { key: 'line:end', tag: 'div', part: 'line' },
  ]
}
