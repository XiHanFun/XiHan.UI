/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提及的标准结构：标题、输入框与浮层（按 collection 铺的候选、空态与在途占位）。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { mentionAnatomy } from './mention.anatomy'
import type { MentionApi, MentionNodeMeta } from './mention.types'

type MentionPart = (typeof mentionAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const MENTION_STRUCTURE_PARTS = [
  'label',
  'input',
  'positioner',
  'content',
  'item',
  'item-prefix',
  'item-text',
  'item-description',
  'item-suffix',
  'empty',
  'loading',
] as const satisfies readonly MentionPart[]

/** anatomy 里不进标准结构的部件。 */
export const MENTION_STRUCTURE_OMITS = [] as const satisfies readonly MentionPart[]

type MentionStructurePart = (typeof MENTION_STRUCTURE_PARTS)[number]

type MentionStructureNode = StructureNode<MentionStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface MentionStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 空态文字：给了就写进 empty，没给时取 emptyText（translations.empty）；empty 插槽有内容时内容归作者。 */
  empty?: string
  /** 输入框铺成多行的 textarea，缺省是单行的 input。 */
  multiline?: boolean
  /**
   * 作者给了哪些插槽的内容：label、empty、item（候选文字）、item-prefix、item-suffix，后三个按候选的值带 key。
   * 候选文字没给插槽时铺 collection 里的 label；行首、行尾没给插槽时不铺这两格。
   */
  slotted?: StructureSlotted
}

type MentionStructureModel = Pick<MentionApi, 'collection' | 'emptyText' | 'loadingText'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一条候选：行首、文字、副文本、行尾；带 slot 的格子的 data 是这一条的元信息。 */
function itemStructure(node: MentionNodeMeta, slotted: StructureSlotted): MentionStructureNode {
  const children: MentionStructureNode[] = []
  if (slotted('item-prefix', node.value))
    children.push({ key: 'prefix', tag: 'span', part: 'item-prefix', slot: { name: 'item-prefix', key: node.value }, data: node })
  children.push(slotted('item', node.value)
    ? { key: 'text', tag: 'span', part: 'item-text', slot: { name: 'item', key: node.value }, data: node }
    : { key: 'text', tag: 'span', part: 'item-text', text: node.label })
  if (node.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: node.description })
  if (slotted('item-suffix', node.value))
    children.push({ key: 'suffix', tag: 'span', part: 'item-suffix', slot: { name: 'item-suffix', key: node.value }, data: node })
  return { key: `item:${node.value}`, tag: 'div', part: 'item', attrs: { value: node.value }, children }
}

/**
 * 提及在 root 里的标准结构，次序是标题、输入框、浮层；标题是原生 label，输入框缺省单行、开了 multiline 是 textarea。
 * 浮层里先是候选列表（collection 每条一个候选，过滤归调用方），再是空态与在途占位，露哪一块归连接层。
 */
export function mentionStructure(model: MentionStructureModel, options: MentionStructureOptions = {}): MentionStructureNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: MentionStructureNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push(
    { key: 'input', tag: options.multiline ? 'textarea' : 'input', part: 'input' },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [
        { key: 'content', tag: 'div', part: 'content', children: model.collection.map(node => itemStructure(node, slotted)) },
        slotted('empty')
          ? { key: 'empty', tag: 'div', part: 'empty', slot: { name: 'empty' } }
          : { key: 'empty', tag: 'div', part: 'empty', text: options.empty ?? model.emptyText },
        { key: 'loading', tag: 'div', part: 'loading', text: model.loadingText },
      ],
    },
  )
  return nodes
}
