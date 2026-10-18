/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 状态栏上的一项：标签与值两段，值按语气着色；给了 action 的是一颗 ghost 小按钮（如缩放，点了回到 100%）。
// 各款把它写上 slot="status-start" 或 slot="status-end" 交给外框。

import type { Tone } from '@xihan-ui/core'
import { createAuthoredElement, setAttributes, setText } from '@xihan-ui/web-components/authoring'
import { defineStatusElements } from '../internal/ui-elements'

/** 一项状态的内容。 */
export interface DesignerStatusItemState {
  /** 标签，弱一档显示在值前面；不给只显示值。 */
  readonly label?: string
  /** 值。 */
  readonly value: string
  /** 值的语气，如保存失败写 danger。 */
  readonly tone?: Tone
}

/** createStatusItem 的选项。 */
export interface DesignerStatusItemOptions extends DesignerStatusItemState {
  /** 给了就是一颗按钮，点击时调用；建好之后不能再改成纯文字或反过来。 */
  readonly action?: () => void
}

/** 状态栏上的一项。 */
export interface DesignerStatusItem {
  /** 交给外框的元素：有 action 时是 <xh-button>，否则是一段文字。 */
  readonly element: HTMLElement
  /** 换上新的标签、值与语气。 */
  readonly update: (state: DesignerStatusItemState) => void
}

/** 建状态栏上的一项。 */
export function createStatusItem(doc: Document, options: DesignerStatusItemOptions): DesignerStatusItem {
  const label = createAuthoredElement(doc, 'span', { 'data-scope': 'designer-frame', 'data-part': 'status-label' })
  const value = createAuthoredElement(doc, 'span', { 'data-scope': 'designer-frame', 'data-part': 'status-value' })
  let element: HTMLElement
  if (options.action) {
    defineStatusElements()
    const action = options.action
    const face = createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [label, value])
    face.addEventListener('click', () => action())
    element = createAuthoredElement(doc, 'xh-button', { 'variant': 'ghost', 'size': 'sm', 'data-scope': 'designer-frame', 'data-part': 'status-item' }, [face])
  }
  else {
    element = createAuthoredElement(doc, 'span', { 'data-scope': 'designer-frame', 'data-part': 'status-item' }, [label, value])
  }
  const update = (state: DesignerStatusItemState): void => {
    setText(label, state.label ?? '')
    label.hidden = state.label === undefined
    setText(value, state.value)
    setAttributes(value, { 'data-tone': state.tone })
  }
  update(options)
  return { element, update }
}
