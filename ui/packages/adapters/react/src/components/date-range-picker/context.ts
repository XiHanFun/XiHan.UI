/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps } from '@xihan-ui/headless'
import type { DateRangePickerContext } from './use-date-range-picker'
import { createContext, useContext } from 'react'

/** 分段容器自报的组号：0 是起点那组，1 是终点那组。 */
export type DateRangePickerGroupIndex = 0 | 1

const Ctx = createContext<DateRangePickerContext | undefined>(undefined)
/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)
/** 没有分段容器时的组号，段位与隐藏输入落到起点那组。 */
const SegmentGroupCtx = createContext<DateRangePickerGroupIndex>(0)
/** 日历没自报面板号时的落点，与单面板时一致。 */
const PanelCtx = createContext<number>(0)

export const DateRangePickerProvider = Ctx
export const DateRangePickerCellProvider = CellCtx
export const DateRangePickerSegmentGroupProvider = SegmentGroupCtx
export const DateRangePickerPanelProvider = PanelCtx

export function useDateRangePickerContext(): DateRangePickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('DateRangePicker 的部件要放在 XhDateRangePickerRoot 里')
  return ctx
}

export function useDateRangePickerCellContext(): CalendarCellProps {
  const cell = useContext(CellCtx)
  if (!cell)
    throw new Error('XhDateRangePickerCellTrigger 要放在 XhDateRangePickerCell 里')
  return cell
}

export function useDateRangePickerSegmentGroupContext(): DateRangePickerGroupIndex {
  return useContext(SegmentGroupCtx)
}

export function useDateRangePickerPanelContext(): number {
  return useContext(PanelCtx)
}
