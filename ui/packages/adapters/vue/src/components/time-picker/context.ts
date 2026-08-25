import type { TimePickerColumnUnit } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TimePickerContext } from './use-time-picker'
import { inject, provide } from 'vue'

/** 列自报的单位，供列内选项取到自己归哪一列。 */
export interface TimePickerColumnContext {
  unit: ComputedRef<TimePickerColumnUnit>
}

const KEY: InjectionKey<TimePickerContext> = Symbol.for('xh-time-picker')
const COLUMN_KEY: InjectionKey<TimePickerColumnContext> = Symbol.for('xh-time-picker-column')

export function provideTimePicker(ctx: TimePickerContext): void {
  provide(KEY, ctx)
}

export function useTimePickerContext(): TimePickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TimePicker 部件必须用在 XhTimePickerRoot 内')
  return ctx
}

export function provideTimePickerColumn(ctx: TimePickerColumnContext): void {
  provide(COLUMN_KEY, ctx)
}

export function useTimePickerColumnContext(): TimePickerColumnContext {
  const ctx = inject(COLUMN_KEY, null)
  if (!ctx)
    throw new Error('[xh] TimePicker 选项必须用在 XhTimePickerColumn 内')
  return ctx
}
