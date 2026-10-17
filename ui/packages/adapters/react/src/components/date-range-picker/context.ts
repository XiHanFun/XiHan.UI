/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CalendarCellProps, DatePickerTimeUnit, DateRangePickerEndIndex } from '@xihan-ui/headless'
import type { DateRangePickerContext } from './use-date-range-picker'
import { createContext, useContext } from 'react'

/** 分段容器声明的组号：0 是起点组，1 是终点组。 */
export type DateRangePickerGroupIndex = 0 | 1

const Ctx = createContext<DateRangePickerContext | undefined>(undefined)
/** 格子声明的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)
/** 没有分段容器时的组号，段位与隐藏输入落到起点组。 */
const SegmentGroupCtx = createContext<DateRangePickerGroupIndex>(0)
/** 日历未声明面板号时的落点，与单面板时一致。 */
const PanelCtx = createContext<number>(0)
/** 时间组声明的端号，供组内的小标题、时间列与时间项认领起止之一。 */
const ColumnGroupCtx = createContext<DateRangePickerEndIndex | undefined>(undefined)
/** 时间列声明的单位，供列里的时间项认领。 */
const TimeColumnCtx = createContext<DatePickerTimeUnit | undefined>(undefined)

export const DateRangePickerProvider = Ctx
export const DateRangePickerCellProvider = CellCtx
export const DateRangePickerSegmentGroupProvider = SegmentGroupCtx
export const DateRangePickerPanelProvider = PanelCtx
export const DateRangePickerColumnGroupProvider = ColumnGroupCtx
export const DateRangePickerTimeColumnProvider = TimeColumnCtx

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

export function useDateRangePickerColumnGroupContext(): DateRangePickerEndIndex {
  const index = useContext(ColumnGroupCtx)
  if (index === undefined)
    throw new Error('DateRangePicker 的时间列与小标题要放在 XhDateRangePickerColumnGroup 里')
  return index
}

export function useDateRangePickerTimeColumnContext(): DatePickerTimeUnit {
  const unit = useContext(TimeColumnCtx)
  if (unit === undefined)
    throw new Error('XhDateRangePickerTimeItem 要放在 XhDateRangePickerTimeColumn 里')
  return unit
}
