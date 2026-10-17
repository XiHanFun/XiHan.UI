/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期选择器的标准结构：标题，盒里的段组（多选时是标签行）、清空钮与触发钮，表单影子，
// 浮层里的快捷选项、日历（每个面板一份）、时间列与底栏。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { CalendarStructurePart } from '../shared/calendar/structure'
import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { datePickerAnatomy } from './date-picker.anatomy'
import type { DatePickerApi } from './date-picker.types'
import { dateSegmentGroupChildren } from '../date-field/date-field.structure'
import { calendarPanelStructure } from '../shared/calendar/structure'

type DatePickerPart = (typeof datePickerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const DATE_PICKER_STRUCTURE_PARTS = [
  'label',
  'control',
  'tag-list',
  'segment-group',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'preset-group',
  'preset',
  'calendar',
  'time-column',
  'time-item',
  'footer',
  'confirm-trigger',
] as const satisfies readonly DatePickerPart[]

/** anatomy 里不进标准结构的部件。 */
export const DATE_PICKER_STRUCTURE_OMITS = [] as const satisfies readonly DatePickerPart[]

type DatePickerStructurePart = (typeof DATE_PICKER_STRUCTURE_PARTS)[number]

/** 委派出去的部件：分段输入的段与表单影子、标签与 +N、内嵌日历的部件，名字取元素委派声明里的。 */
type DatePickerDelegatedPart = 'segment' | 'hidden-input' | 'tag' | 'tag-label' | 'item-delete-trigger' | 'overflow-tag' | CalendarStructurePart

type DatePickerNode = StructureNode<DatePickerStructurePart | DatePickerDelegatedPart>

/** 结构里要不要铺这几个可选部件。 */
export interface DatePickerStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

type DatePickerStructureModel = Pick<DatePickerApi, 'selectionMode' | 'tags' | 'field' | 'presets' | 'showTime' | 'timeColumns' | 'getTimeItemText' | 'translations'> & {
  calendar: Pick<DatePickerApi['calendar'], 'panels' | 'weekDays' | 'headingOrder'>
}

/**
 * 日期选择器在 root 里的标准结构，次序是标题、盒、表单影子、浮层。
 * - 盒：单选时是段组（段按 locale 排、段间是分隔符文字），多选时是标签行（已选日期一枚一个带删除钮的标签，摆不下的折进 +N），
 *   后面是清空钮与触发钮；清不了时清空钮由连接层收起。
 * - 浮层：有快捷选项时先铺快捷选项列；日历每个面板一份；带时间时再铺各时间列与底栏的确认钮。
 *   浮层里这几块直接并排，横排与换行由皮肤按在场的部件排。
 */
export function datePickerStructure(model: DatePickerStructureModel, options: DatePickerStructureOptions = {}): DatePickerNode[] {
  const multiple = model.selectionMode === 'multiple'
  const nodes: DatePickerNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })

  const entry: DatePickerNode = multiple
    ? {
        key: 'tag-list',
        tag: 'span',
        part: 'tag-list',
        children: [
          ...model.tags.map((tag): DatePickerNode => ({
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
      }
    : { key: 'segment-group', tag: 'div', part: 'segment-group', children: dateSegmentGroupChildren(model.field, 'date-field') }

  const content: DatePickerNode[] = []
  if (model.presets.length > 0) {
    content.push({
      key: 'preset-group',
      tag: 'div',
      part: 'preset-group',
      children: model.presets.map((preset): DatePickerNode => ({ key: `preset:${preset.value}`, tag: 'div', part: 'preset', attrs: { value: preset.value }, text: preset.label })),
    })
  }
  for (const panel of model.calendar.panels) {
    content.push({
      key: `calendar:${panel.index}`,
      tag: 'div',
      part: 'calendar',
      attrs: { index: String(panel.index) },
      children: calendarPanelStructure(model.calendar, panel, 'calendar-picker'),
    })
  }
  if (model.showTime) {
    for (const column of model.timeColumns) {
      content.push({
        key: `time-column:${column.unit}`,
        tag: 'div',
        part: 'time-column',
        attrs: { unit: column.unit },
        children: column.options.map((value): DatePickerNode => ({
          key: `time-item:${value}`,
          tag: 'div',
          part: 'time-item',
          attrs: { value },
          text: model.getTimeItemText({ unit: column.unit, value }),
        })),
      })
    }
    content.push({
      key: 'footer',
      tag: 'div',
      part: 'footer',
      children: [{ key: 'confirm-trigger', tag: 'button', part: 'confirm-trigger', text: model.translations.confirmTrigger }],
    })
  }

  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: [
        entry,
        { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' },
        { key: 'trigger', tag: 'button', part: 'trigger' },
      ],
    },
    { key: 'hidden-input', tag: 'input', component: 'date-field', part: 'hidden-input' },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: content }],
    },
  )
  return nodes
}
