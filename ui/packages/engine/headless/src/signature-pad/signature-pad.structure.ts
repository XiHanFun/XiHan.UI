/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 签名板的标准结构：标题、画布（基准线与笔迹）、清空按钮、状态与表单影子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { signaturePadAnatomy } from './signature-pad.anatomy'
import type { SignaturePadApi } from './signature-pad.types'

type SignaturePadPart = (typeof signaturePadAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const SIGNATURE_PAD_STRUCTURE_PARTS = [
  'label',
  'control',
  'guide',
  'path',
  'clear-trigger',
  'status',
  'hidden-input',
] as const satisfies readonly SignaturePadPart[]

/** anatomy 里不进标准结构的部件：撤销与重做按钮由作者手写结构时自己摆。 */
export const SIGNATURE_PAD_STRUCTURE_OMITS = [
  'undo-trigger',
  'redo-trigger',
] as const satisfies readonly SignaturePadPart[]

type SignaturePadStructurePart = (typeof SIGNATURE_PAD_STRUCTURE_PARTS)[number]

type SignaturePadNode = StructureNode<SignaturePadStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface SignaturePadStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 铺不铺表单影子，缺省不铺；给了字段名时传 true。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容，只认 label。 */
  slotted?: StructureSlotted
}

type SignaturePadStructureModel = Pick<SignaturePadApi, 'statusText' | 'translations'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/**
 * 签名板在 root 里的标准结构，次序是标题、画布、清空按钮、状态、表单影子。
 * 画布是 svg，里面先基准线、后笔迹；清空按钮的字与状态的字取 translations 与此刻的签名状态。
 */
export function signaturePadStructure(model: SignaturePadStructureModel, options: SignaturePadStructureOptions = {}): SignaturePadNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: SignaturePadNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(
    {
      key: 'control',
      tag: 'svg',
      part: 'control',
      children: [
        { key: 'guide', tag: 'line', part: 'guide' },
        { key: 'path', tag: 'path', part: 'path' },
      ],
    },
    { key: 'clear-trigger', tag: 'button', part: 'clear-trigger', text: model.translations.clearTrigger },
    { key: 'status', tag: 'span', part: 'status', text: model.statusText },
  )
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  return nodes
}
