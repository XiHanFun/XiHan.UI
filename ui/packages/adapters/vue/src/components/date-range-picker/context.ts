/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { DateRangePickerContext } from './use-date-range-picker'
import { computed, inject, provide } from 'vue'

/** 格子声明的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface DateRangePickerCellContext {
  cell: ComputedRef<CalendarCellProps>
}

/** 分段容器声明的组号，供组内的段位与隐藏输入认领起止两组之一。 */
export interface DateRangePickerSegmentGroupContext {
  /** 0 是起点组，1 是终点组。 */
  index: ComputedRef<0 | 1>
}

/** 日历声明的面板号，供面板内的标题、网格与格子认领自己属于并排的第几张。 */
export interface DateRangePickerPanelContext {
  index: ComputedRef<number>
}

const KEY: InjectionKey<DateRangePickerContext> = Symbol.for('xh-date-range-picker')
const CELL_KEY: InjectionKey<DateRangePickerCellContext> = Symbol.for('xh-date-range-picker-cell')
const SEGMENT_GROUP_KEY: InjectionKey<DateRangePickerSegmentGroupContext> = Symbol.for('xh-date-range-picker-segment-group')
const PANEL_KEY: InjectionKey<DateRangePickerPanelContext> = Symbol.for('xh-date-range-picker-panel')

/** 没有分段容器时的组号，段位与隐藏输入落到起点组。 */
const START_GROUP: DateRangePickerSegmentGroupContext = { index: computed<0 | 1>(() => 0) }

/** 日历未声明面板号时的落点，与单面板时一致。 */
const FIRST_PANEL: DateRangePickerPanelContext = { index: computed(() => 0) }

export function provideDateRangePicker(ctx: DateRangePickerContext): void {
  provide(KEY, ctx)
}

export function useDateRangePickerContext(): DateRangePickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] DateRangePicker 部件必须用在 XhDateRangePickerRoot 内')
  return ctx
}

export function provideDateRangePickerCell(ctx: DateRangePickerCellContext): void {
  provide(CELL_KEY, ctx)
}

export function useDateRangePickerCellContext(): DateRangePickerCellContext {
  const ctx = inject(CELL_KEY, null)
  if (!ctx)
    throw new Error('[xh] DateRangePicker 日期触发器必须用在 XhDateRangePickerCell 内')
  return ctx
}

export function provideDateRangePickerSegmentGroup(ctx: DateRangePickerSegmentGroupContext): void {
  provide(SEGMENT_GROUP_KEY, ctx)
}

export function useDateRangePickerSegmentGroupContext(): DateRangePickerSegmentGroupContext {
  return inject(SEGMENT_GROUP_KEY, START_GROUP)
}

export function provideDateRangePickerPanel(ctx: DateRangePickerPanelContext): void {
  provide(PANEL_KEY, ctx)
}

export function useDateRangePickerPanelContext(): DateRangePickerPanelContext {
  return inject(PANEL_KEY, FIRST_PANEL)
}
