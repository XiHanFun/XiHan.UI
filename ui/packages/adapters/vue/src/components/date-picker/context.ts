import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { DatePickerContext } from './use-date-picker'
import { computed, inject, provide } from 'vue'

/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface DatePickerCellContext {
  cell: ComputedRef<CalendarCellProps>
}

/** 分段容器自报组号，供组内的段位与隐藏输入认领起止两组之一。 */
export interface DatePickerSegmentGroupContext {
  /** 0 是起点那组，1 是区间终点那组。 */
  index: ComputedRef<0 | 1>
}

const KEY: InjectionKey<DatePickerContext> = Symbol('xh-date-picker')
const CELL_KEY: InjectionKey<DatePickerCellContext> = Symbol('xh-date-picker-cell')
const SEGMENT_GROUP_KEY: InjectionKey<DatePickerSegmentGroupContext> = Symbol('xh-date-picker-segment-group')

/** 没有分段容器时的组号，段位与隐藏输入落到起点那组。 */
const START_GROUP: DatePickerSegmentGroupContext = { index: computed<0 | 1>(() => 0) }

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

export function provideDatePickerSegmentGroup(ctx: DatePickerSegmentGroupContext): void {
  provide(SEGMENT_GROUP_KEY, ctx)
}

export function useDatePickerSegmentGroupContext(): DatePickerSegmentGroupContext {
  return inject(SEGMENT_GROUP_KEY, START_GROUP)
}
