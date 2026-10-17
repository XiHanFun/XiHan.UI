/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 密码框的标准结构：标题、盒里的输入框、大写锁定提示与明暗切换钮、强度条。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { passwordInputAnatomy } from './password-input.anatomy'
import type { PasswordInputApi } from './password-input.types'

type PasswordInputPart = (typeof passwordInputAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const PASSWORD_INPUT_STRUCTURE_PARTS = [
  'label',
  'control',
  'input',
  'caps-lock-indicator',
  'visibility-trigger',
  'strength-meter',
] as const satisfies readonly PasswordInputPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const PASSWORD_INPUT_STRUCTURE_OMITS = [] as const satisfies readonly PasswordInputPart[]

type PasswordInputNode = StructureNode<(typeof PASSWORD_INPUT_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺标题。 */
export interface PasswordInputStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/**
 * 密码框在 root 里的标准结构，次序是标题、盒、强度条。盒里依次是输入框、大写锁定提示（文字由组件写）
 * 与明暗切换钮；给了 strength 才铺强度条。
 */
export function passwordInputStructure(model: Pick<PasswordInputApi, 'strength'>, options: PasswordInputStructureOptions = {}): PasswordInputNode[] {
  const nodes: PasswordInputNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push({
    key: 'control',
    tag: 'div',
    part: 'control',
    children: [
      { key: 'input', tag: 'input', part: 'input' },
      { key: 'caps-lock-indicator', tag: 'span', part: 'caps-lock-indicator' },
      { key: 'visibility-trigger', tag: 'button', part: 'visibility-trigger' },
    ],
  })
  if (model.strength !== undefined)
    nodes.push({ key: 'strength-meter', tag: 'div', part: 'strength-meter' })
  return nodes
}
