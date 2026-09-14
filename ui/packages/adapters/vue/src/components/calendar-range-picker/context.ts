/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CalendarRangePickerContext } from './use-calendar-range-picker'
import { inject, provide } from 'vue'

/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface CalendarRangePickerCellContext {
  cell: ComputedRef<CalendarCellProps>
}

const KEY: InjectionKey<CalendarRangePickerContext> = Symbol.for('xh-calendar-range-picker')
const CELL_KEY: InjectionKey<CalendarRangePickerCellContext> = Symbol.for('xh-calendar-range-picker-cell')

export function provideCalendarRangePicker(ctx: CalendarRangePickerContext): void {
  provide(KEY, ctx)
}

export function useCalendarRangePickerContext(): CalendarRangePickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] CalendarRangePicker 部件必须用在 XhCalendarRangePickerRoot 内')
  return ctx
}

export function provideCalendarRangePickerCell(ctx: CalendarRangePickerCellContext): void {
  provide(CELL_KEY, ctx)
}

export function useCalendarRangePickerCellContext(): CalendarRangePickerCellContext {
  const ctx = inject(CELL_KEY, null)
  if (!ctx)
    throw new Error('[xh] CalendarRangePicker 日期触发器必须用在 XhCalendarRangePickerCell 内')
  return ctx
}
