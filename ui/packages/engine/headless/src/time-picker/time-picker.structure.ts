/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 时间选择器的标准结构：标题，盒里的段组（多选时是标签行）、清空钮与触发钮，表单影子，
// 浮层里的快捷选项、各时间列，多选时再加底栏的添加钮。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { TimeSegmentType } from '../time-field/time-field.types'
import type { timePickerAnatomy } from './time-picker.anatomy'
import type { TimePickerApi } from './time-picker.types'

type TimePickerPart = (typeof timePickerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const TIME_PICKER_STRUCTURE_PARTS = [
  'label',
  'control',
  'tag-list',
  'segment-group',
  'segment',
  'trigger',
  'clear-trigger',
  'positioner',
  'content',
  'preset-group',
  'preset',
  'column',
  'item',
  'footer',
  'confirm-trigger',
  'hidden-input',
] as const satisfies readonly TimePickerPart[]

/** anatomy 里不进标准结构的部件。 */
export const TIME_PICKER_STRUCTURE_OMITS = [] as const satisfies readonly TimePickerPart[]

type TimePickerStructurePart = (typeof TIME_PICKER_STRUCTURE_PARTS)[number]

/** 委派出去的部件：多选时的标签、标签文字、删除钮与 +N，名字取元素委派声明里的。 */
type TimePickerDelegatedPart = 'tag' | 'tag-label' | 'item-delete-trigger' | 'overflow-tag'

type TimePickerNode = StructureNode<TimePickerStructurePart | TimePickerDelegatedPart>

/** 结构里要不要铺这几个可选部件。 */
export interface TimePickerStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 作者给了哪些插槽的内容：只有 label。 */
  slotted?: StructureSlotted
}

type TimePickerStructureModel = Pick<TimePickerApi, 'selectionMode' | 'tags' | 'segments' | 'presets' | 'columns' | 'getItemText' | 'translations'>

/** 前后两段之间的分隔符：时、分、秒之间是冒号，挨着上下午段的是空格。 */
function literalBetween(before: TimeSegmentType, after: TimeSegmentType): string {
  return before === 'dayPeriod' || after === 'dayPeriod' ? ' ' : ':'
}

/** 段组里的子节点：按当前段序铺段，段与段之间是分隔符文字。时间选择器与时间范围选择器的起止两组共用。 */
export function timeSegmentGroupChildren(segments: readonly TimeSegmentType[]): StructureChild<'segment'>[] {
  const group: StructureChild<'segment'>[] = []
  segments.forEach((segment, i) => {
    const previous = segments[i - 1]
    if (previous)
      group.push({ key: `literal:${previous}`, literal: literalBetween(previous, segment) })
    group.push({ key: `segment:${segment}`, tag: 'span', part: 'segment', attrs: { segment } })
  })
  return group
}

/**
 * 时间选择器在 root 里的标准结构，次序是标题、盒、表单影子、浮层。
 * - 盒：单选时是段组（段按当前段序铺，段间是分隔符文字），多选时是标签行（每个选中值一枚带删除钮的标签，
 *   摆不下的折进 +N），后面是清空钮与触发钮；清不了时清空钮由连接层收起。
 * - 浮层：有快捷选项时先铺快捷选项列；各时间列按当前精度与小时制铺；多选时再铺底栏的添加钮。
 */
export function timePickerStructure(model: TimePickerStructureModel, options: TimePickerStructureOptions = {}): TimePickerNode[] {
  const multiple = model.selectionMode === 'multiple'
  const nodes: TimePickerNode[] = []
  if (options.slotted?.('label'))
    nodes.push({ key: 'label', tag: 'label', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'label', part: 'label', text: options.label })

  let entry: TimePickerNode
  if (multiple) {
    entry = {
      key: 'tag-list',
      tag: 'span',
      part: 'tag-list',
      children: [
        ...model.tags.map((tag): TimePickerNode => ({
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
  }
  else {
    entry = { key: 'segment-group', tag: 'div', part: 'segment-group', children: timeSegmentGroupChildren(model.segments) }
  }

  const content: TimePickerNode[] = []
  if (model.presets.length > 0) {
    content.push({
      key: 'preset-group',
      tag: 'div',
      part: 'preset-group',
      children: model.presets.map((preset): TimePickerNode => ({ key: `preset:${preset.value}`, tag: 'div', part: 'preset', attrs: { value: preset.value }, text: preset.label })),
    })
  }
  for (const column of model.columns) {
    content.push({
      key: `column:${column.unit}`,
      tag: 'div',
      part: 'column',
      attrs: { unit: column.unit },
      children: column.options.map((value): TimePickerNode => ({
        key: `item:${value}`,
        tag: 'div',
        part: 'item',
        attrs: { value },
        text: model.getItemText({ unit: column.unit, value }),
      })),
    })
  }
  if (multiple) {
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
    { key: 'hidden-input', tag: 'input', part: 'hidden-input' },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [{ key: 'content', tag: 'div', part: 'content', children: content }],
    },
  )
  return nodes
}
