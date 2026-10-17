/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 色板的标准结构：标题与按 swatches 铺的格子。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { colorSwatchPickerAnatomy } from './color-swatch-picker.anatomy'
import type { ColorSwatchPickerApi, ColorSwatchPickerNodeMeta } from './color-swatch-picker.types'

type ColorSwatchPickerPart = (typeof colorSwatchPickerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const COLOR_SWATCH_PICKER_STRUCTURE_PARTS = [
  'label',
  'item',
  'hidden-input',
  'swatch',
  'indicator',
] as const satisfies readonly ColorSwatchPickerPart[]

/** anatomy 里不进标准结构的部件。 */
export const COLOR_SWATCH_PICKER_STRUCTURE_OMITS = [] as const satisfies readonly ColorSwatchPickerPart[]

type ColorSwatchPickerStructurePart = (typeof COLOR_SWATCH_PICKER_STRUCTURE_PARTS)[number]

type ColorSwatchPickerStructureNode = StructureNode<ColorSwatchPickerStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface ColorSwatchPickerStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只认 label。 */
  slotted?: StructureSlotted
}

type ColorSwatchPickerStructureModel = Pick<ColorSwatchPickerApi, 'swatches'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一格：表单影子、色块面与选中标记；名字与禁用由连接层按 swatches 写。 */
function itemStructure(node: ColorSwatchPickerNodeMeta): ColorSwatchPickerStructureNode {
  return {
    key: `item:${node.value}`,
    tag: 'div',
    part: 'item',
    attrs: { value: node.value },
    children: [
      { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
      { key: 'swatch', tag: 'span', part: 'swatch' },
      { key: 'indicator', tag: 'span', part: 'indicator' },
    ],
  }
}

/** 色板在 root 里的标准结构，次序是标题、各格；每条数据一格，没给 swatches 时只有标题。 */
export function colorSwatchPickerStructure(model: ColorSwatchPickerStructureModel, options: ColorSwatchPickerStructureOptions = {}): ColorSwatchPickerStructureNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const nodes: ColorSwatchPickerStructureNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(...model.swatches.map(itemStructure))
  return nodes
}
