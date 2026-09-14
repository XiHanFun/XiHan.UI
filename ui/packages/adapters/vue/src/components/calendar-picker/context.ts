/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CalendarPickerContext } from './use-calendar-picker'
import { inject, provide } from 'vue'

/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface CalendarPickerCellContext {
  cell: ComputedRef<CalendarCellProps>
}

const KEY: InjectionKey<CalendarPickerContext> = Symbol.for('xh-calendar-picker')
const CELL_KEY: InjectionKey<CalendarPickerCellContext> = Symbol.for('xh-calendar-picker-cell')

export function provideCalendarPicker(ctx: CalendarPickerContext): void {
  provide(KEY, ctx)
}

export function useCalendarPickerContext(): CalendarPickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] CalendarPicker 部件必须用在 XhCalendarPickerRoot 内')
  return ctx
}

export function provideCalendarPickerCell(ctx: CalendarPickerCellContext): void {
  provide(CELL_KEY, ctx)
}

export function useCalendarPickerCellContext(): CalendarPickerCellContext {
  const ctx = inject(CELL_KEY, null)
  if (!ctx)
    throw new Error('[xh] CalendarPicker 日期触发器必须用在 XhCalendarPickerCell 内')
  return ctx
}
