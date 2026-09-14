/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { CalendarRangePickerContext } from './use-calendar-range-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<CalendarRangePickerContext | undefined>(undefined)
/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)

export const CalendarRangePickerProvider = Ctx
export const CalendarRangePickerCellProvider = CellCtx

export function useCalendarRangePickerContext(): CalendarRangePickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('CalendarRangePicker 的部件要放在 XhCalendarRangePickerRoot 里')
  return ctx
}

export function useCalendarRangePickerCellContext(): CalendarCellProps {
  const cell = useContext(CellCtx)
  if (!cell)
    throw new Error('XhCalendarRangePickerCellTrigger 要放在 XhCalendarRangePickerCell 里')
  return cell
}
