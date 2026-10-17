/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期范围选择器的标准结构：标题，盒里的起止两组段、分隔符、清空钮与触发钮，两份表单影子，
// 浮层里的快捷选项、日历（每个面板一份）、起止两组时间列与底栏。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { CalendarStructurePart } from '../shared/calendar/structure'
import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { dateRangePickerAnatomy } from './date-range-picker.anatomy'
import type { DateRangePickerApi, DateRangePickerTimeColumnGroup } from './date-range-picker.types'
import { dateSegmentGroupChildren } from '../date-field/date-field.structure'
import { calendarPanelStructure } from '../shared/calendar/structure'

type DateRangePickerPart = (typeof dateRangePickerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const DATE_RANGE_PICKER_STRUCTURE_PARTS = [
  'label',
  'control',
  'segment-group',
  'range-separator',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'preset-group',
  'preset',
  'calendar',
  'column-group',
  'column-group-label',
  'time-column',
  'time-item',
  'footer',
  'confirm-trigger',
] as const satisfies readonly DateRangePickerPart[]

/** anatomy 里不进标准结构的部件。 */
export const DATE_RANGE_PICKER_STRUCTURE_OMITS = [] as const satisfies readonly DateRangePickerPart[]

type DateRangePickerStructurePart = (typeof DATE_RANGE_PICKER_STRUCTURE_PARTS)[number]

/** 委派出去的部件：分段输入的段与表单影子、内嵌区间日历的部件，名字取元素委派声明里的。 */
type DateRangePickerDelegatedPart = 'segment' | 'hidden-input' | CalendarStructurePart

type DateRangePickerNode = StructureNode<DateRangePickerStructurePart | DateRangePickerDelegatedPart>

/** 结构里要不要铺这几个可选部件。 */
export interface DateRangePickerStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

type DateRangePickerStructureModel = Pick<DateRangePickerApi, 'field' | 'fieldEnd' | 'presets' | 'showTime' | 'timeColumnGroups' | 'getTimeItemText' | 'translations'> & {
  calendar: Pick<DateRangePickerApi['calendar'], 'panels' | 'weekDays' | 'headingOrder'>
}

/** 一端的时间组：小标题，再是这一端的各列与列里的格。 */
function columnGroupNode(model: DateRangePickerStructureModel, group: DateRangePickerTimeColumnGroup): DateRangePickerNode {
  const index = String(group.index)
  return {
    key: `column-group:${index}`,
    tag: 'div',
    part: 'column-group',
    attrs: { index },
    children: [
      { key: 'label', tag: 'div', part: 'column-group-label', text: group.label },
      ...group.columns.map((column): DateRangePickerNode => ({
        key: `time-column:${column.unit}`,
        tag: 'div',
        part: 'time-column',
        attrs: { unit: column.unit },
        children: column.options.map((value): DateRangePickerNode => ({
          key: `time-item:${value}`,
          tag: 'div',
          part: 'time-item',
          attrs: { value },
          text: model.getTimeItemText({ unit: column.unit, value }),
        })),
      })),
    ],
  }
}

/**
 * 日期范围选择器在 root 里的标准结构，次序是标题、盒、两份表单影子、浮层。
 * - 盒：起点段组、分隔符、终点段组（段按 locale 排、段间是分隔符文字），后面是清空钮与触发钮；清不了时清空钮由连接层收起。
 * - 表单影子：起止各一份，带 index 认端。
 * - 浮层：有快捷选项时先铺快捷选项列；日历每个面板一份；带时间时再铺起止两组时间列（各带小标题）与底栏的确认钮。
 *   浮层里这几块直接并排，横排与换行由皮肤按在场的部件排。
 */
export function dateRangePickerStructure(model: DateRangePickerStructureModel, options: DateRangePickerStructureOptions = {}): DateRangePickerNode[] {
  const nodes: DateRangePickerNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })

  const content: DateRangePickerNode[] = []
  if (model.presets.length > 0) {
    content.push({
      key: 'preset-group',
      tag: 'div',
      part: 'preset-group',
      children: model.presets.map((preset): DateRangePickerNode => ({ key: `preset:${preset.value}`, tag: 'div', part: 'preset', attrs: { value: preset.value }, text: preset.label })),
    })
  }
  for (const panel of model.calendar.panels) {
    content.push({
      key: `calendar:${panel.index}`,
      tag: 'div',
      part: 'calendar',
      attrs: { index: String(panel.index) },
      children: calendarPanelStructure(model.calendar, panel, 'calendar-range-picker'),
    })
  }
  if (model.showTime) {
    content.push(
      ...model.timeColumnGroups.map(group => columnGroupNode(model, group)),
      {
        key: 'footer',
        tag: 'div',
        part: 'footer',
        children: [{ key: 'confirm-trigger', tag: 'button', part: 'confirm-trigger', text: model.translations.confirmTrigger }],
      },
    )
  }

  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: [
        { key: 'segment-group:0', tag: 'div', part: 'segment-group', attrs: { index: '0' }, children: dateSegmentGroupChildren(model.field, 'date-field') },
        { key: 'range-separator', tag: 'span', part: 'range-separator', text: '-' },
        { key: 'segment-group:1', tag: 'div', part: 'segment-group', attrs: { index: '1' }, children: dateSegmentGroupChildren(model.fieldEnd, 'date-field') },
        { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' },
        { key: 'trigger', tag: 'button', part: 'trigger' },
      ],
    },
    { key: 'hidden-input:0', tag: 'input', component: 'date-field', part: 'hidden-input', attrs: { index: '0' } },
    { key: 'hidden-input:1', tag: 'input', component: 'date-field', part: 'hidden-input', attrs: { index: '1' } },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: content }],
    },
  )
  return nodes
}
