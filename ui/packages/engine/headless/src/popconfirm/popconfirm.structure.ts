/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 弹出确认的标准结构：root 里是触发器与定位层，content 里依次是标题、说明、取消与确认两颗钮、箭头。
// 「删除这条？+ 一句后果 + 取消 / 删除」这样最常见的一条不用再拼八九个部件：几个 props 或插槽给出内容，其余照这一份铺。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { popconfirmAnatomy } from './popconfirm.anatomy'
import type { PopconfirmTranslations } from './popconfirm.types'
import { POPCONFIRM_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'

type PopconfirmPart = (typeof popconfirmAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const POPCONFIRM_STRUCTURE_PARTS = [
  'trigger',
  'positioner',
  'content',
  'title',
  'description',
  'cancel-trigger',
  'confirm-trigger',
  'arrow',
] as const satisfies readonly PopconfirmPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const POPCONFIRM_STRUCTURE_OMITS = [] as const satisfies readonly PopconfirmPart[]

type PopconfirmNode = StructureNode<(typeof POPCONFIRM_STRUCTURE_PARTS)[number]>

/** 结构里各段的文字。 */
export interface PopconfirmStructureOptions {
  /** 触发按钮的文字；trigger 插槽有内容时以插槽为准。两者都没有时铺一颗空的触发器。 */
  triggerText?: string
  /** 标题文字：直接问这次操作；title 插槽有内容时以插槽为准。 */
  title?: string
  /** 说明文字：讲后果；description 插槽有内容时以插槽为准。 */
  description?: string
  /** 确认钮的文字，缺省取 translations.ok。 */
  confirmText?: string
  /** 取消钮的文字，缺省取 translations.cancel。 */
  cancelText?: string
  /** 两颗钮的缺省文字从这里取。 */
  translations?: Partial<PopconfirmTranslations>
  /** 作者给了哪些插槽的内容：trigger、title、description。 */
  slotted?: StructureSlotted
}

/** 一段文字：插槽有内容时交给作者，否则写给的文字；两者都没有（或是空串）时这一段不铺。 */
function textPart(part: 'title' | 'description', tag: 'h2' | 'p', text: string | undefined, slotted: StructureSlotted): PopconfirmNode | null {
  if (slotted(part))
    return { key: part, tag, part, slot: { name: part } }
  return text != null && text !== '' ? { key: part, tag, part, text } : null
}

/**
 * 弹出确认在 root 里的标准结构：触发器在前，定位层在后；content 里给了标题、说明才铺对应一段（标题在前），
 * 取消钮排在确认钮之前——它是文档序里第一个可聚焦元素，展开时焦点先落在退路上；箭头排在最后。
 */
export function popconfirmStructure(options: PopconfirmStructureOptions = {}): PopconfirmNode[] {
  const slotted: StructureSlotted = name => options.slotted?.(name) ?? false
  const labels = resolveTranslations(POPCONFIRM_EN_US, options.translations)
  let trigger: PopconfirmNode
  if (slotted('trigger'))
    trigger = { key: 'trigger', tag: 'button', part: 'trigger', slot: { name: 'trigger' } }
  else if (options.triggerText != null && options.triggerText !== '')
    trigger = { key: 'trigger', tag: 'button', part: 'trigger', text: options.triggerText }
  else
    trigger = { key: 'trigger', tag: 'button', part: 'trigger' }

  const content = [
    textPart('title', 'h2', options.title, slotted),
    textPart('description', 'p', options.description, slotted),
  ].filter((node): node is PopconfirmNode => node !== null)
  content.push(
    { key: 'cancel-trigger', tag: 'button', part: 'cancel-trigger', text: options.cancelText ?? labels.cancel },
    { key: 'confirm-trigger', tag: 'button', part: 'confirm-trigger', text: options.confirmText ?? labels.ok },
    { key: 'arrow', tag: 'div', part: 'arrow' },
  )

  return [
    trigger,
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: content }],
    },
  ]
}
