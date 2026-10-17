/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分格输入的标准结构：标题、一段装下全部格子的分段，以及给了 name 时的表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { pinInputAnatomy } from './pin-input.anatomy'
import type { PinInputApi } from './pin-input.types'

type PinInputPart = (typeof pinInputAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const PIN_INPUT_STRUCTURE_PARTS = [
  'label',
  'group',
  'input',
  'hidden-input',
] as const satisfies readonly PinInputPart[]

/** anatomy 里不进标准结构的部件：段间分隔只在分段写法里用，要分段时作者手写结构。 */
export const PIN_INPUT_STRUCTURE_OMITS = [
  'separator',
] as const satisfies readonly PinInputPart[]

type PinInputNode = StructureNode<(typeof PIN_INPUT_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface PinInputStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 带不带表单影子：给了 name 才带，缺省不带。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/**
 * 分格输入在 root 里的标准结构，次序是标题、分段、表单影子。
 * root 竖排标题与格子，格子排成一行要有一层横排的容器：这里用一段装下全部 length 个格子，每格写上自己的下标。
 */
export function pinInputStructure(model: Pick<PinInputApi, 'length'>, options: PinInputStructureOptions = {}): PinInputNode[] {
  const nodes: PinInputNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  nodes.push({
    key: 'group',
    tag: 'div',
    part: 'group',
    children: Array.from({ length: model.length }, (_, index): PinInputNode => ({ key: `input:${index}`, tag: 'input', part: 'input', attrs: { index: String(index) } })),
  })
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
