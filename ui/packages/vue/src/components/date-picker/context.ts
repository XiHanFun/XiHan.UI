import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { DatePickerContext } from './use-date-picker'
import { inject, provide } from 'vue'

/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface DatePickerCellContext {
  cell: ComputedRef<CalendarCellProps>
}

const KEY: InjectionKey<DatePickerContext> = Symbol('xh-date-picker')
const CELL_KEY: InjectionKey<DatePickerCellContext> = Symbol('xh-date-picker-cell')

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
