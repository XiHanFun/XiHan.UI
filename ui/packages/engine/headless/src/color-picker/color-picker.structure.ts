/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 取色器的标准结构：标题、盒（多选的标签行与触发钮）、浮层里的取色面，常驻形态把取色面直接铺在 root 里。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { colorPickerAnatomy } from './color-picker.anatomy'
import type { ColorPickerApi } from './color-picker.types'

type ColorPickerPart = (typeof colorPickerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const COLOR_PICKER_STRUCTURE_PARTS = [
  'label',
  'control',
  'tag-list',
  'trigger',
  'value-text',
  'swatch',
  'positioner',
  'content',
  'saturation-area',
  'area-thumb',
  'hue-slider',
  'alpha-slider',
  'channel-input',
  'swatch-picker',
  'recent-swatch-picker',
  'confirm-trigger',
  'hidden-input',
] as const satisfies readonly ColorPickerPart[]

/** anatomy 里不进标准结构的部件：屏幕取色按钮要放图标，由作者手写结构时自己摆。 */
export const COLOR_PICKER_STRUCTURE_OMITS = [
  'eye-dropper-trigger',
] as const satisfies readonly ColorPickerPart[]

type ColorPickerStructurePart = (typeof COLOR_PICKER_STRUCTURE_PARTS)[number]

/**
 * 委派出去的部件，名字取元素委派声明里的：颜色滑块的 control / track / thumb，色块选择器每一格的
 * item / hidden-input / swatch / indicator，以及多选标签、标签文字、删除钮与 +N 那一枚。
 */
type ColorPickerDelegatedPart = 'track' | 'thumb' | 'item' | 'indicator' | 'tag' | 'tag-label' | 'item-delete-trigger' | 'overflow-tag'

type ColorPickerNode = StructureNode<ColorPickerStructurePart | ColorPickerDelegatedPart>

/** 结构里要不要铺这几个可选部件。 */
export interface ColorPickerStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 铺不铺表单影子，缺省不铺；给了字段名时传 true。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容，只认 label。 */
  slotted?: StructureSlotted
}

type ColorPickerStructureModel = Pick<ColorPickerApi, 'inline' | 'selectionMode' | 'alpha' | 'tags' | 'swatchPicker' | 'recentSwatchPicker' | 'translations'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一条内嵌的颜色滑块：挂载点里是颜色滑块的 control，其中一条轨道、一个拇指。 */
function sliderStructure(key: string, part: 'hue-slider' | 'alpha-slider'): ColorPickerNode {
  return {
    key,
    tag: 'div',
    part,
    children: [{
      key: 'control',
      tag: 'div',
      component: 'color-slider',
      part: 'control',
      children: [
        { key: 'track', tag: 'div', component: 'color-slider', part: 'track' },
        { key: 'thumb', tag: 'div', component: 'color-slider', part: 'thumb' },
      ],
    }],
  }
}

/** 一台内嵌的色块选择器：每个颜色一格，格里依次是表单影子、色块与选中标记。 */
function swatchPickerStructure(key: string, part: 'swatch-picker' | 'recent-swatch-picker', values: readonly string[]): ColorPickerNode {
  return {
    key,
    tag: 'div',
    part,
    children: values.map((value): ColorPickerNode => ({
      key: `item:${value}`,
      tag: 'div',
      component: 'color-swatch-picker',
      part: 'item',
      attrs: { value },
      children: [
        { key: 'hidden-input', tag: 'input', component: 'color-swatch-picker', part: 'hidden-input' },
        { key: 'swatch', tag: 'span', component: 'color-swatch-picker', part: 'swatch' },
        { key: 'indicator', tag: 'span', component: 'color-swatch-picker', part: 'indicator' },
      ],
    })),
  }
}

/**
 * 取色器在 root 里的标准结构。浮层形态的次序是标题、盒、表单影子、浮层；常驻形态是标题、取色面、表单影子。
 * 盒里多选时先是标签行（标签带文字与删除钮，摆不下的折进 +N），再是触发钮（色块与值串）。
 * 取色面里依次是取色区、色相滑块、透明度滑块（开了 alpha 才铺）、十六进制输入框、预设色板（给了 swatches 才铺）、
 * 最近使用色，多选时末尾是「添加」，字取 translations。
 */
export function colorPickerStructure(model: ColorPickerStructureModel, options: ColorPickerStructureOptions = {}): ColorPickerNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const multiple = model.selectionMode === 'multiple'
  const panel: ColorPickerNode[] = [
    { key: 'saturation-area', tag: 'div', part: 'saturation-area', children: [{ key: 'area-thumb', tag: 'div', part: 'area-thumb' }] },
    sliderStructure('hue-slider', 'hue-slider'),
  ]
  if (model.alpha)
    panel.push(sliderStructure('alpha-slider', 'alpha-slider'))
  panel.push({ key: 'channel-input', tag: 'input', part: 'channel-input', attrs: { channel: 'hex' } })
  const swatches = model.swatchPicker.swatches.map(node => node.value)
  if (swatches.length > 0)
    panel.push(swatchPickerStructure('swatch-picker', 'swatch-picker', swatches))
  panel.push(swatchPickerStructure('recent-swatch-picker', 'recent-swatch-picker', model.recentSwatchPicker.swatches.map(node => node.value)))
  if (multiple)
    panel.push({ key: 'confirm-trigger', tag: 'button', part: 'confirm-trigger', text: model.translations.confirmTrigger })
  const content: ColorPickerNode = { key: 'content', tag: 'div', part: 'content', children: panel }

  const nodes: ColorPickerNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  if (!model.inline) {
    const control: ColorPickerNode[] = []
    if (multiple) {
      control.push({
        key: 'tag-list',
        tag: 'span',
        part: 'tag-list',
        children: [
          ...model.tags.map((tag): ColorPickerNode => ({
            key: `tag:${tag.value}`,
            tag: 'span',
            component: 'tag',
            part: 'tag',
            attrs: { value: tag.value },
            children: [
              { key: 'label', tag: 'span', component: 'tag', part: 'tag-label', text: tag.label },
              { key: 'delete', tag: 'button', component: 'tag', part: 'item-delete-trigger' },
            ],
          })),
          { key: 'overflow-tag', tag: 'span', component: 'tag', part: 'overflow-tag' },
        ],
      })
    }
    control.push({
      key: 'trigger',
      tag: 'button',
      part: 'trigger',
      children: [
        { key: 'swatch', tag: 'span', part: 'swatch' },
        { key: 'value-text', tag: 'span', part: 'value-text' },
      ],
    })
    nodes.push({ key: 'control', tag: 'div', part: 'control', children: control })
  }
  else {
    nodes.push(content)
  }
  if (options.hiddenInput)
    nodes.push({ key: 'hidden-input', tag: 'input', part: 'hidden-input' })
  if (!model.inline)
    nodes.push({ key: 'positioner', tag: 'div', part: 'positioner', children: [content] })
  return nodes
}
