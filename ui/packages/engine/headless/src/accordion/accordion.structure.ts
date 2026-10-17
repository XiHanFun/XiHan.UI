/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 手风琴的标准结构：按 collection 每条铺一个条目（标题里的按钮与指示符、正文面板）。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { accordionAnatomy } from './accordion.anatomy'
import type { AccordionApi, AccordionNodeMeta } from './accordion.types'

type AccordionPart = (typeof accordionAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const ACCORDION_STRUCTURE_PARTS = [
  'item',
  'header',
  'trigger',
  'indicator',
  'content',
] as const satisfies readonly AccordionPart[]

/** anatomy 里不进标准结构的部件：条目之间的分隔线由作者手写结构时自己摆。 */
export const ACCORDION_STRUCTURE_OMITS = [
  'item-separator',
] as const satisfies readonly AccordionPart[]

type AccordionNode = StructureNode<(typeof ACCORDION_STRUCTURE_PARTS)[number]>

/** 结构里各条目的正文怎么铺。 */
export interface AccordionStructureOptions {
  /**
   * 作者给了哪些插槽的内容：content（正文），按条目的值带 key。
   * 正文没给插槽时铺 collection 里的 content。
   */
  slotted?: StructureSlotted
  /**
   * 这一条的正文此刻挂不挂：不挂时正文面板空着，缺省都挂。
   * Vue / React 的正文部件自己按挂载判定渲内容，不必传；Web Components 按各面板的退场闸门传进来。
   */
  mounted?: (node: AccordionNodeMeta) => boolean
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一个条目：标题（h3）里的按钮装标题文字与指示符，后面是正文面板；带 slot 的正文的 data 是这一条的元信息。 */
function itemStructure(node: AccordionNodeMeta, slotted: StructureSlotted, mounted: boolean): AccordionNode {
  const content: AccordionNode = slotted('content', node.value)
    ? { key: 'content', tag: 'div', part: 'content', slot: { name: 'content', key: node.value }, data: node }
    : { key: 'content', tag: 'div', part: 'content', text: mounted ? (node.content ?? '') : '' }
  return {
    key: `item:${node.value}`,
    tag: 'div',
    part: 'item',
    attrs: { value: node.value },
    children: [
      {
        key: 'header',
        tag: 'h3',
        part: 'header',
        children: [{
          key: 'trigger',
          tag: 'button',
          part: 'trigger',
          children: [
            { key: 'label', literal: node.label },
            { key: 'indicator', tag: 'span', part: 'indicator' },
          ],
        }],
      },
      content,
    ],
  }
}

/** 手风琴在 root 里的标准结构：collection 里每条一个条目，按 collection 的先后排。 */
export function accordionStructure(model: Pick<AccordionApi, 'collection'>, options: AccordionStructureOptions = {}): AccordionNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  return model.collection.map(node => itemStructure(node, slotted, options.mounted?.(node) ?? true))
}
