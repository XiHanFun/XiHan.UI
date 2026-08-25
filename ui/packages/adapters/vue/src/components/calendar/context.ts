import type { CalendarCellProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CalendarContext } from './use-calendar'
import { inject, provide } from 'vue'

/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
export interface CalendarCellContext {
  cell: ComputedRef<CalendarCellProps>
}

const KEY: InjectionKey<CalendarContext> = Symbol.for('xh-calendar')
const CELL_KEY: InjectionKey<CalendarCellContext> = Symbol.for('xh-calendar-cell')

export function provideCalendar(ctx: CalendarContext): void {
  provide(KEY, ctx)
}

export function useCalendarContext(): CalendarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Calendar 部件必须用在 XhCalendarRoot 内')
  return ctx
}

export function provideCalendarCell(ctx: CalendarCellContext): void {
  provide(CELL_KEY, ctx)
}

export function useCalendarCellContext(): CalendarCellContext {
  const ctx = inject(CELL_KEY, null)
  if (!ctx)
    throw new Error('[xh] Calendar 日期触发器必须用在 XhCalendarCell 内')
  return ctx
}
