/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层面板（对话框、抽屉）的标准结构：触发器、遮罩、定位层，content 里依次是页头（标题与说明）、正文、
// 页脚（取消与确定）与关闭钮。两个组件的部件名与标签一一相同，结构只有这一份。

import type { StructureChild, StructureNode, StructureSlotted } from './structure'

/** 页脚铺哪几颗钮：confirm 是取消 + 确定（缺省），alert 只有确定，none 不铺。 */
export type PanelStructureActions = 'confirm' | 'alert' | 'none'

/** 结构里各段的文字与页脚的写法。 */
export interface PanelStructureOptions {
  /** 触发按钮的文字；trigger 插槽有内容时以插槽为准。两者都没有时不铺触发器，开合交给受控的 open。 */
  triggerText?: string
  /** 标题文字；title 插槽有内容时以插槽为准。 */
  title?: string
  /** 说明文字；description 插槽有内容时以插槽为准。 */
  description?: string
  /** 页脚铺哪几颗钮，缺省 confirm；footer 插槽有内容时整段页脚归作者。 */
  actions?: PanelStructureActions
  /** 确定钮的文字，缺省取 translations.ok。 */
  confirmText?: string
  /** 取消钮的文字，缺省取 translations.cancel。 */
  cancelText?: string
  /** 作者给了哪些插槽的内容：trigger、title、description、body、footer。 */
  slotted?: StructureSlotted
}

/** 面板结构会产出的部件。 */
export type PanelStructurePart = 'trigger' | 'backdrop' | 'positioner' | 'content' | 'header' | 'title' | 'description' | 'body' | 'footer' | 'cancel-trigger' | 'confirm-trigger' | 'close-trigger'

type PanelNode<P extends string> = StructureNode<P>

/** 一段文字：插槽有内容时交给作者，否则写给的文字；两者都没有时这一段不铺。 */
function textPart(part: 'title' | 'description', tag: 'h2' | 'p', text: string | undefined, slotted: StructureSlotted): PanelNode<PanelStructurePart> | null {
  if (slotted(part))
    return { key: part, tag, part, slot: { name: part } }
  return text != null && text !== '' ? { key: part, tag, part, text } : null
}

/**
 * 面板的标准结构。触发器在前（给了文字或插槽才铺），遮罩，定位层里是 content：
 * 给了标题或说明才铺页头（标题在前），给了正文才铺正文，页脚按 actions 铺取消与确定（footer 插槽接管整段），
 * 关闭钮排在页脚之后，tail 是组件自己补在 content 末尾的部件（抽屉的改尺把手）。
 * labels 是确定、取消钮的缺省文字（组件已解析好的 translations）。
 */
export function panelStructure<Extra extends string = never>(
  options: PanelStructureOptions,
  labels: { readonly ok: string, readonly cancel: string },
  tail: readonly PanelNode<Extra>[] = [],
): PanelNode<PanelStructurePart | Extra>[] {
  const slotted: StructureSlotted = name => options.slotted?.(name) ?? false
  const nodes: PanelNode<PanelStructurePart | Extra>[] = []

  if (slotted('trigger'))
    nodes.push({ key: 'trigger', tag: 'button', part: 'trigger', slot: { name: 'trigger' } })
  else if (options.triggerText != null && options.triggerText !== '')
    nodes.push({ key: 'trigger', tag: 'button', part: 'trigger', text: options.triggerText })

  const content: PanelNode<PanelStructurePart | Extra>[] = []
  const header = [textPart('title', 'h2', options.title, slotted), textPart('description', 'p', options.description, slotted)]
    .filter((node): node is PanelNode<PanelStructurePart> => node !== null)
  if (header.length > 0)
    content.push({ key: 'header', tag: 'header', part: 'header', children: header })
  if (slotted('body'))
    content.push({ key: 'body', tag: 'div', part: 'body', slot: { name: 'body' } })

  const actions = options.actions ?? 'confirm'
  if (slotted('footer')) {
    content.push({ key: 'footer', tag: 'footer', part: 'footer', slot: { name: 'footer' } })
  }
  else if (actions !== 'none') {
    const buttons: PanelNode<PanelStructurePart>[] = []
    if (actions === 'confirm')
      buttons.push({ key: 'cancel-trigger', tag: 'button', part: 'cancel-trigger', text: options.cancelText ?? labels.cancel })
    buttons.push({ key: 'confirm-trigger', tag: 'button', part: 'confirm-trigger', text: options.confirmText ?? labels.ok })
    content.push({ key: 'footer', tag: 'footer', part: 'footer', children: buttons })
  }
  content.push({ key: 'close-trigger', tag: 'button', part: 'close-trigger' }, ...tail)

  nodes.push(
    { key: 'backdrop', tag: 'div', part: 'backdrop' },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: content }],
    },
  )
  return nodes
}

/**
 * Vue / React 的 content 部件自己装配遮罩与定位层：渲缺省树时摘掉这两层，定位层里的 content 提到原处。
 * Web Components 照结构生成这两层节点，不调它。
 */
export function withoutPanelShell<P extends string>(nodes: readonly StructureChild<P>[]): StructureChild<P>[] {
  return nodes.flatMap((node) => {
    if (!('part' in node))
      return [node]
    if (node.part === 'backdrop')
      return []
    if (node.part === 'positioner')
      return [...(node.children ?? [])]
    return [node]
  })
}
