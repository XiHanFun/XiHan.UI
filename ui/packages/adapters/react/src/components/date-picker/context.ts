import type { CalendarCellProps } from '@xihan-ui/headless'
import type { DatePickerContext } from './use-date-picker'
import { createContext, useContext } from 'react'

/** 分段容器自报的组号：0 是起点那组，1 是区间终点那组。 */
export type DatePickerGroupIndex = 0 | 1

const Ctx = createContext<DatePickerContext | undefined>(undefined)
/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)
/** 没有分段容器时的组号，段位与隐藏输入落到起点那组。 */
const SegmentGroupCtx = createContext<DatePickerGroupIndex>(0)
/** 日历没自报面板号时的落点，与单面板时一致。 */
const PanelCtx = createContext<number>(0)

export const DatePickerProvider = Ctx
export const DatePickerCellProvider = CellCtx
export const DatePickerSegmentGroupProvider = SegmentGroupCtx
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

export function useDatePickerSegmentGroupContext(): DatePickerGroupIndex {
  return useContext(SegmentGroupCtx)
}

export function useDatePickerPanelContext(): number {
  return useContext(PanelCtx)
}
