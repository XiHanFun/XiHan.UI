/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文字提示的标准结构：触发器，定位层里的 content 装着提示文字与箭头。
// 「一颗按钮 + 一句提示」这样最常见的一条不用再拼四五个部件：几个 props 或插槽给出内容，其余照这一份铺。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { tooltipAnatomy } from './tooltip.anatomy'

type TooltipPart = (typeof tooltipAnatomy)['parts'][number]

/** 结构会产出的部件；文字提示没有 root，部件直接长在组件或元素里。 */
export const TOOLTIP_STRUCTURE_PARTS = [
  'trigger',
  'positioner',
  'content',
  'text',
  'arrow',
] as const satisfies readonly TooltipPart[]

/** anatomy 里不进标准结构的部件：快捷键只在委托模式下由组件按锚点的 aria-keyshortcuts 生成。 */
export const TOOLTIP_STRUCTURE_OMITS = [
  'shortcut',
] as const satisfies readonly TooltipPart[]

type TooltipNode = StructureNode<(typeof TOOLTIP_STRUCTURE_PARTS)[number]>

/** 结构里各段的内容。 */
export interface TooltipStructureOptions {
  /** 触发按钮的文字；trigger 插槽有内容时以插槽为准。两者都没有时铺一颗空的触发器。 */
  triggerText?: string
  /** 提示文字；content 插槽有内容时以插槽为准。两者都没有时 content 里只有箭头。 */
  content?: string
  /**
   * 委托模式：trigger 是装着一个个锚点的容器（div，锚点写进 trigger 插槽），提示文字与快捷键由组件按当前锚点铺，
   * 结构不铺 text，content 里只有箭头。
   */
  delegated?: boolean
  /** 作者给了哪些插槽的内容：trigger、content。 */
  slotted?: StructureSlotted
}

/**
 * 文字提示的标准结构：触发器在前，定位层在后；定位层里是 content，content 里先是装提示文字的 text、再是箭头。
 * text 是一段 span：提示就是一句话，插槽里的内容同样落在这段 span 里。委托模式下 text 由组件自己铺，这里不铺。
 */
export function tooltipStructure(options: TooltipStructureOptions = {}): TooltipNode[] {
  const slotted: StructureSlotted = name => options.slotted?.(name) ?? false
  const tag = options.delegated ? 'div' : 'button'
  let trigger: TooltipNode
  if (slotted('trigger'))
    trigger = { key: 'trigger', tag, part: 'trigger', slot: { name: 'trigger' } }
  else if (options.triggerText != null && options.triggerText !== '')
    trigger = { key: 'trigger', tag, part: 'trigger', text: options.triggerText }
  else
    trigger = { key: 'trigger', tag, part: 'trigger' }

  const content: TooltipNode[] = []
  if (!options.delegated) {
    if (slotted('content'))
      content.push({ key: 'text', tag: 'span', part: 'text', slot: { name: 'content' } })
    else if (options.content != null && options.content !== '')
      content.push({ key: 'text', tag: 'span', part: 'text', text: options.content })
  }
  content.push({ key: 'arrow', tag: 'div', part: 'arrow' })

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
