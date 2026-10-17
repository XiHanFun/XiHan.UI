/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间范围选择器的标准结构：标题，盒里的起止两组段、分隔符、清空钮与触发钮，起止两份表单影子，
// 浮层里的快捷选项与起止两组时间列。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { timeRangePickerAnatomy } from './time-range-picker.anatomy'
import type { TimeRangePickerApi, TimeRangePickerColumnGroup } from './time-range-picker.types'
import { timeSegmentGroupChildren } from '../time-picker/time-picker.structure'

type TimeRangePickerPart = (typeof timeRangePickerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TIME_RANGE_PICKER_STRUCTURE_PARTS = [
  'label',
  'control',
  'segment-group',
  'segment',
  'range-separator',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'preset-group',
  'preset',
  'column-group',
  'column-group-label',
  'column',
  'item',
  'hidden-input',
] as const satisfies readonly TimeRangePickerPart[]

/** anatomy 里不进标准结构的部件。 */
export const TIME_RANGE_PICKER_STRUCTURE_OMITS = [] as const satisfies readonly TimeRangePickerPart[]

type TimeRangePickerStructurePart = (typeof TIME_RANGE_PICKER_STRUCTURE_PARTS)[number]

type TimeRangePickerNode = StructureNode<TimeRangePickerStructurePart>

/** 结构里要不要铺这几个可选部件。 */
export interface TimeRangePickerStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

type TimeRangePickerStructureModel = Pick<TimeRangePickerApi, 'segments' | 'presets' | 'columnGroups' | 'getItemText' | 'translations'>

/** 一端的时间组：小标题（起点取 translations.startTime、终点取 endTime），再是这一端的各列与列里的格。 */
function columnGroupNode(model: TimeRangePickerStructureModel, group: TimeRangePickerColumnGroup): TimeRangePickerNode {
  const index = String(group.index)
  return {
    key: `column-group:${index}`,
    tag: 'div',
    part: 'column-group',
    attrs: { index },
    children: [
      { key: 'label', tag: 'div', part: 'column-group-label', text: group.index === 0 ? model.translations.startTime : model.translations.endTime },
      ...group.columns.map((column): TimeRangePickerNode => ({
        key: `column:${column.unit}`,
        tag: 'div',
        part: 'column',
        attrs: { unit: column.unit },
        children: column.options.map((value): TimeRangePickerNode => ({
          key: `item:${value}`,
          tag: 'div',
          part: 'item',
          attrs: { value },
          text: model.getItemText({ unit: column.unit, value }),
        })),
      })),
    ],
  }
}

/**
 * 时间范围选择器在 root 里的标准结构，次序是标题、盒、两份表单影子、浮层。
 * - 盒：起点段组、分隔符、终点段组（两组段序相同，段间是分隔符文字），后面是清空钮与触发钮；清不了时清空钮由连接层收起。
 * - 表单影子：起止各一份，带 index 认端。
 * - 浮层：有快捷选项时先铺快捷选项列，再是起止两组时间列，各带小标题。
 */
export function timeRangePickerStructure(model: TimeRangePickerStructureModel, options: TimeRangePickerStructureOptions = {}): TimeRangePickerNode[] {
  const nodes: TimeRangePickerNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })

  const content: TimeRangePickerNode[] = []
  if (model.presets.length > 0) {
    content.push({
      key: 'preset-group',
      tag: 'div',
      part: 'preset-group',
      children: model.presets.map((preset): TimeRangePickerNode => ({ key: `preset:${preset.value}`, tag: 'div', part: 'preset', attrs: { value: preset.value }, text: preset.label })),
    })
  }
  content.push(...model.columnGroups.map(group => columnGroupNode(model, group)))

  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: [
        { key: 'segment-group:0', tag: 'div', part: 'segment-group', attrs: { index: '0' }, children: timeSegmentGroupChildren(model.segments) },
        { key: 'range-separator', tag: 'span', part: 'range-separator', text: '-' },
        { key: 'segment-group:1', tag: 'div', part: 'segment-group', attrs: { index: '1' }, children: timeSegmentGroupChildren(model.segments) },
        { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' },
        { key: 'trigger', tag: 'button', part: 'trigger' },
      ],
    },
    { key: 'hidden-input:0', tag: 'input', part: 'hidden-input', attrs: { index: '0' } },
    { key: 'hidden-input:1', tag: 'input', part: 'hidden-input', attrs: { index: '1' } },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: content }],
    },
  )
  return nodes
}
