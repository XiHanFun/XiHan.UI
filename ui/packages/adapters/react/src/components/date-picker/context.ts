/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { DatePickerContext } from './use-date-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<DatePickerContext | undefined>(undefined)
/** 格子声明的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)
/** 日历未声明面板号时的落点，与单面板时一致。 */
const PanelCtx = createContext<number>(0)

export const DatePickerProvider = Ctx
export const DatePickerCellProvider = CellCtx
export const DatePickerPanelProvider = PanelCtx

export function useDatePickerContext(): DatePickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('DatePicker 的部件要放在 XhDatePickerRoot 里')
  return ctx
}

export function useDatePickerCellContext(): CalendarCellProps {
  const cell = useContext(CellCtx)
  if (!cell)
    throw new Error('XhDatePickerCellTrigger 要放在 XhDatePickerCell 里')
  return cell
}

export function useDatePickerPanelContext(): number {
  return useContext(PanelCtx)
}
