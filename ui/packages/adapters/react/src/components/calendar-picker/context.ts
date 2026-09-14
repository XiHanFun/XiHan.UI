/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { CalendarPickerContext } from './use-calendar-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<CalendarPickerContext | undefined>(undefined)
/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)

export const CalendarPickerProvider = Ctx
export const CalendarPickerCellProvider = CellCtx

export function useCalendarPickerContext(): CalendarPickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('CalendarPicker 的部件要放在 XhCalendarPickerRoot 里')
  return ctx
}

export function useCalendarPickerCellContext(): CalendarCellProps {
  const cell = useContext(CellCtx)
  if (!cell)
    throw new Error('XhCalendarPickerCellTrigger 要放在 XhCalendarPickerCell 里')
  return cell
}
