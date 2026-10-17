/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 开关的标准结构：按钮（root）里的滑块，给了 name 时再带一份表单影子。
// Vue / React 的 XhSwitch 渲按钮里面这一段、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { switchAnatomy } from './switch.anatomy'

type SwitchPart = (typeof switchAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const SWITCH_STRUCTURE_PARTS = [
  'thumb',
  'hidden-input',
] as const satisfies readonly SwitchPart[]

/**
 * anatomy 里不进标准结构的部件：带文字时 label 包住 root 与 text，是 root 的外层，不在 root 的子树里。
 * Vue / React 给了文字时自己包；Web Components 要带文字时作者手写这三个部件。
 */
export const SWITCH_STRUCTURE_OMITS = [
  'label',
  'text',
] as const satisfies readonly SwitchPart[]

type SwitchNode = StructureNode<(typeof SWITCH_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface SwitchStructureOptions {
  /** 带不带表单影子：给了 name 才带，缺省不带。type=hidden 不是交互内容，放在按钮里是合法的。 */
  hiddenInput?: boolean
}

/** 开关在 root（按钮）里的标准结构：滑块，以及可选的表单影子。 */
export function switchStructure(options: SwitchStructureOptions = {}): SwitchNode[] {
  const nodes: SwitchNode[] = [{ key: 'thumb', tag: 'span', part: 'thumb' }]
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
