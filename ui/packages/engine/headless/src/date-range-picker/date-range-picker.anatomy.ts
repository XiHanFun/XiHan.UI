/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker 相关实现。

import { createAnatomy } from '@xihan-ui/core'

/**
 * data-part 用 kebab-case，与 CSS 选择器一致。
 *
 * segment-group 写两个（起点、终点），calendar 是挂载点：内部分别是 DateField 的段位
 * （data-scope="date-field"）与 CalendarRangePicker 的网格（data-scope="calendar-range-picker"）。
 * 内嵌 DOM 须保留各自的 scope：日历翻月后的焦点归位按 calendar-range-picker 的 cell-trigger
 * 查活 DOM，改了 scope 就查不到。
 *
 * range-separator 是两组段位之间的视觉分隔；preset-group 是浮层里的快捷选项列
 * （「近 7 天」「本月」这类），preset 是其中一项，选项的身份由作者写在节点上。
 */
export const dateRangePickerAnatomy = createAnatomy('date-range-picker', [
  'root',
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
])
