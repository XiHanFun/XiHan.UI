/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { DatePickerContext } from './use-date-picker'
import { computed, inject, provide } from 'vue'

/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface DatePickerCellContext {
  cell: ComputedRef<CalendarCellProps>
}

/** 日历自报面板号，供面板内的标题、网格与格子认领自己属于并排的第几张。 */
export interface DatePickerPanelContext {
  index: ComputedRef<number>
}

const KEY: InjectionKey<DatePickerContext> = Symbol.for('xh-date-picker')
const CELL_KEY: InjectionKey<DatePickerCellContext> = Symbol.for('xh-date-picker-cell')
const PANEL_KEY: InjectionKey<DatePickerPanelContext> = Symbol.for('xh-date-picker-panel')

/** 日历没自报面板号时的落点，与单面板时一致。 */
const FIRST_PANEL: DatePickerPanelContext = { index: computed(() => 0) }

export function provideDatePicker(ctx: DatePickerContext): void {
  provide(KEY, ctx)
}

export function useDatePickerContext(): DatePickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] DatePicker 部件必须用在 XhDatePickerRoot 内')
  return ctx
}

export function provideDatePickerCell(ctx: DatePickerCellContext): void {
  provide(CELL_KEY, ctx)
}

export function useDatePickerCellContext(): DatePickerCellContext {
  const ctx = inject(CELL_KEY, null)
  if (!ctx)
    throw new Error('[xh] DatePicker 日期触发器必须用在 XhDatePickerCell 内')
  return ctx
}

export function provideDatePickerPanel(ctx: DatePickerPanelContext): void {
  provide(PANEL_KEY, ctx)
}

export function useDatePickerPanelContext(): DatePickerPanelContext {
  return inject(PANEL_KEY, FIRST_PANEL)
}
