/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy, itemValue, queryItems } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// segment-group 是多实例 part：起止各一组，data-index 区分，各自把段位与作者写的分隔符兜成一块；
// range-separator 隔在两组之间。segment 同分段时间输入（每段一个 spinbutton、整组一个 Tab 位）。
// column-group 也是起止各一个：一端的几列并排成组，column-group-label 是组顶上的小标题；
// column 是一列 listbox，item 是列里的选项；列间靠左右键换（跨组也换），列内靠上下键走。
// preset-group 是浮层里的快捷选项列（「上午」「全天」这类），preset 是其中一项。
// hidden-input 起止各一份，data-index 区分。
export const timeRangePickerAnatomy = createAnatomy('time-range-picker', [
  'root',
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
])

/** 分段输入的集合：容器取所在的 segment-group，方向键不跨组。 */
export const timeRangePickerSegmentQuery: ItemQuery = { scope: timeRangePickerAnatomy.name, part: 'segment' }

/** 快捷选项的集合：容器取那一列自己。选项自报 data-value 为自己的值。 */
export const timeRangePickerPresetQuery: ItemQuery = { scope: timeRangePickerAnatomy.name, part: 'preset' }

/** 列组的集合：容器取 content。列组自报 data-value 为自己是哪一端（'0' / '1'）。 */
export const timeRangePickerColumnGroupQuery: ItemQuery = { scope: timeRangePickerAnatomy.name, part: 'column-group' }

/** 列的集合：容器取 content（跨组换列）或某一个列组。列自报 data-value 为自己的单位。 */
export const timeRangePickerColumnQuery: ItemQuery = { scope: timeRangePickerAnatomy.name, part: 'column' }

/**
 * 选项的集合：容器取所属的列。
 * queryItems 按归属过滤，隔壁列的同名选项（分列与秒列都有 '30'）不会串过来。
 */
export const timeRangePickerItemQuery: ItemQuery = { scope: timeRangePickerAnatomy.name, part: 'item' }

/** 按端找到列组节点；无 DOM 环境或该组未渲染时为 null。 */
export function findTimeRangePickerColumnGroup(content: HTMLElement | null, index: number): HTMLElement | null {
  return queryItems(content, timeRangePickerColumnGroupQuery)
    .find(el => itemValue(el) === String(index)) ?? null
}

/** 按端与单位找到列节点；无 DOM 环境或该列未渲染时为 null。 */
export function findTimeRangePickerColumn(content: HTMLElement | null, index: number, unit: string): HTMLElement | null {
  return queryItems(findTimeRangePickerColumnGroup(content, index), timeRangePickerColumnQuery)
    .find(el => itemValue(el) === unit) ?? null
}

/** 按端、单位与值找到选项节点；焦点落位与确认键都在事件那一刻现查它。 */
export function findTimeRangePickerItem(content: HTMLElement | null, index: number, unit: string, value: string): HTMLElement | null {
  return queryItems(findTimeRangePickerColumn(content, index, unit), timeRangePickerItemQuery)
    .find(el => itemValue(el) === value) ?? null
}
