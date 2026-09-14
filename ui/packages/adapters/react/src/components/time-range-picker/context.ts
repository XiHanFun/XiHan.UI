/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TimePickerColumnUnit, TimeRangePickerEndIndex } from '@xihan-ui/headless'
import type { TimeRangePickerContext } from './use-time-range-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<TimeRangePickerContext | undefined>(undefined)
/** 段位容器与时列外壳自报的端号：0 是起点那组，1 是终点那组；没有容器时落到起点那组。 */
const EndCtx = createContext<TimeRangePickerEndIndex>(0)
/** 列自报的单位，供列内选项取到自己归哪一列。 */
const ColumnCtx = createContext<TimePickerColumnUnit | undefined>(undefined)

export const TimeRangePickerProvider = Ctx
export const TimeRangePickerEndProvider = EndCtx
export const TimeRangePickerColumnProvider = ColumnCtx

export function useTimeRangePickerContext(): TimeRangePickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('TimeRangePicker 的部件要放在 XhTimeRangePickerRoot 里')
  return ctx
}

export function useTimeRangePickerEndContext(): TimeRangePickerEndIndex {
  return useContext(EndCtx)
}

export function useTimeRangePickerColumnContext(): TimePickerColumnUnit {
  const unit = useContext(ColumnCtx)
  if (!unit)
    throw new Error('XhTimeRangePickerItem 要放在 XhTimeRangePickerColumn 里')
  return unit
}
