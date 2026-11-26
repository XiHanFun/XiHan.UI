/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 警告提示的标准结构：图标、文本列（标题与说明）、操作区、关闭钮。
// 「标题 + 说明」这样最常见的一条不用再拼四五个部件：几个 props 或插槽给出内容，其余照这一份铺。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { alertAnatomy } from './alert.anatomy'

type AlertPart = (typeof alertAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const ALERT_STRUCTURE_PARTS = [
  'indicator',
  'content',
  'title',
  'description',
  'action',
  'close-trigger',
] as const satisfies readonly AlertPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const ALERT_STRUCTURE_OMITS = [] as const satisfies readonly AlertPart[]

type AlertNode = StructureNode<(typeof ALERT_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几段。 */
export interface AlertStructureOptions {
  /** 标题文字：给了就铺带这段文字的标题；title 插槽有内容时铺内容归作者的标题。 */
  title?: string
  /** 说明文字：给了就铺带这段文字的说明；description 插槽有内容时铺内容归作者的说明。 */
  description?: string
  /**
   * 作者写的 closable，不是补过缺省的值：写了真才铺关闭钮。
   * 手写结构时关闭钮放不放由作者决定，closable 缺省为真只管放了的那颗按不按得动；
   * 标准结构替作者放，不写就不替他添一颗叉。
   */
  closable?: boolean
  /** 作者给了哪些插槽的内容：indicator、title、description、action。 */
  slotted?: StructureSlotted
}

/** 一段文字：插槽有内容时交给作者，否则写给的文字；两者都没有（或是空串）时这一段不铺。 */
function textPart(part: 'title' | 'description', text: string | undefined, slotted: StructureSlotted): AlertNode | null {
  if (slotted(part))
    return { key: part, tag: 'div', part, slot: { name: part } }
  return text != null && text !== '' ? { key: part, tag: 'div', part, text } : null
}

/**
 * 警告提示在 root 里的标准结构，次序是图标、文本列、操作区、关闭钮，与手写部件的文档序相同。
 * 文本列是必备部件，恒铺，里面给了标题、说明才铺对应一段（标题在前）；图标与操作区只来自插槽；
 * 关闭钮在作者写了 closable 时铺在末尾，内容为空，叉由皮肤画。
 */
export function alertStructure(options: AlertStructureOptions = {}): AlertNode[] {
  const slotted: StructureSlotted = name => options.slotted?.(name) ?? false
  const nodes: AlertNode[] = []
  if (slotted('indicator'))
    nodes.push({ key: 'indicator', tag: 'span', part: 'indicator', slot: { name: 'indicator' } })
  const text = [textPart('title', options.title, slotted), textPart('description', options.description, slotted)]
    .filter((node): node is AlertNode => node !== null)
  nodes.push({ key: 'content', tag: 'div', part: 'content', children: text })
  if (slotted('action'))
    nodes.push({ key: 'action', tag: 'div', part: 'action', slot: { name: 'action' } })
  if (options.closable === true)
    nodes.push({ key: 'close-trigger', tag: 'button', part: 'close-trigger' })
  return nodes
}
