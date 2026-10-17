/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 滑块的标准结构：标题、控制区里的轨道与已选区间、刻度、每个值一个拇指。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { sliderAnatomy } from './slider.anatomy'
import type { SliderApi } from './slider.types'

type SliderPart = (typeof sliderAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const SLIDER_STRUCTURE_PARTS = [
  'label',
  'control',
  'track',
  'range',
  'tick-group',
  'tick',
  'tick-label',
  'thumb',
  'hidden-input',
] as const satisfies readonly SliderPart[]

/** anatomy 里不进标准结构的部件：拖动时的数值气泡挂在拇指里，要用时作者手写结构。 */
export const SLIDER_STRUCTURE_OMITS = [
  'value-text',
] as const satisfies readonly SliderPart[]

type SliderNode = StructureNode<(typeof SLIDER_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface SliderStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 每个拇指里带不带表单影子：给了 name 才带，缺省不带。 */
  hiddenInput?: boolean
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

/**
 * 滑块在 root 里的标准结构，次序是标题、控制区。控制区里依次是轨道（内含已选区间）、刻度（给了 marks 才铺，
 * 每个刻度一个圆点与一段文案）、每个值一个拇指（写明自己是第几个，给了 name 再带表单影子）。
 */
export function sliderStructure(model: Pick<SliderApi, 'value' | 'marks'>, options: SliderStructureOptions = {}): SliderNode[] {
  const nodes: SliderNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })
  const control: SliderNode[] = [
    { key: 'track', tag: 'div', part: 'track', children: [{ key: 'range', tag: 'div', part: 'range' }] },
  ]
  if (model.marks.length > 0) {
    control.push({
      key: 'tick-group',
      tag: 'div',
      part: 'tick-group',
      children: model.marks.flatMap((mark): SliderNode[] => {
        const value = String(mark.value)
        const label: SliderNode = { key: `tick-label:${value}`, tag: 'span', part: 'tick-label', attrs: { value } }
        return [
          { key: `tick:${value}`, tag: 'span', part: 'tick', attrs: { value } },
          mark.label === undefined ? label : { ...label, text: mark.label },
        ]
      }),
    })
  }
  model.value.forEach((_, index) => {
    const thumb: SliderNode = { key: `thumb:${index}`, tag: 'div', part: 'thumb', attrs: { index: String(index) } }
    control.push(options.hiddenInput ? { ...thumb, children: [{ key: 'hidden-input', tag: 'input', part: 'hidden-input' }] } : thumb)
  })
  nodes.push({ key: 'control', tag: 'div', part: 'control', children: control })
  return nodes
}
