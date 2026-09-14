/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TimePickerColumnUnit, TimeRangePickerEndIndex } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TimeRangePickerContext } from './use-time-range-picker'
import { computed, inject, provide } from 'vue'

/** 段位容器与时列外壳自报的端号，供组内的段位、列与选项认领自己属于起点还是终点。 */
export interface TimeRangePickerEndContext {
  /** 0 是起点那组，1 是终点那组。 */
  index: ComputedRef<TimeRangePickerEndIndex>
}

/** 列自报的单位，供列内选项取到自己归哪一列。 */
export interface TimeRangePickerColumnContext {
  unit: ComputedRef<TimePickerColumnUnit>
}

const KEY: InjectionKey<TimeRangePickerContext> = Symbol.for('xh-time-range-picker')
const END_KEY: InjectionKey<TimeRangePickerEndContext> = Symbol.for('xh-time-range-picker-end')
const COLUMN_KEY: InjectionKey<TimeRangePickerColumnContext> = Symbol.for('xh-time-range-picker-column')

/** 没有段位容器 / 时列外壳时的端号，落到起点那组。 */
const START_END: TimeRangePickerEndContext = { index: computed<TimeRangePickerEndIndex>(() => 0) }

export function provideTimeRangePicker(ctx: TimeRangePickerContext): void {
  provide(KEY, ctx)
}

export function useTimeRangePickerContext(): TimeRangePickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TimeRangePicker 部件必须用在 XhTimeRangePickerRoot 内')
  return ctx
}

export function provideTimeRangePickerEnd(ctx: TimeRangePickerEndContext): void {
  provide(END_KEY, ctx)
}

export function useTimeRangePickerEndContext(): TimeRangePickerEndContext {
  return inject(END_KEY, START_END)
}

export function provideTimeRangePickerColumn(ctx: TimeRangePickerColumnContext): void {
  provide(COLUMN_KEY, ctx)
}

export function useTimeRangePickerColumnContext(): TimeRangePickerColumnContext {
  const ctx = inject(COLUMN_KEY, null)
  if (!ctx)
    throw new Error('[xh] TimeRangePicker 选项必须用在 XhTimeRangePickerColumn 内')
  return ctx
}
