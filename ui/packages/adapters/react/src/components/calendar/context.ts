import type { CalendarCellProps } from '@xihan-ui/headless'
import type { CalendarContext } from './use-calendar'
import { createContext, useContext } from 'react'

const Ctx = createContext<CalendarContext | undefined>(undefined)
/** 格子自报的那一天，供 cell-trigger 复用同一份声明（作者只写一次 value）。 */
const CellCtx = createContext<CalendarCellProps | undefined>(undefined)

export const CalendarProvider = Ctx
export const CalendarCellProvider = CellCtx

export function useCalendarContext(): CalendarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('Calendar 的部件要放在 XhCalendarRoot 里')
  return ctx
}

export function useCalendarCellContext(): CalendarCellProps {
  const cell = useContext(CellCtx)
  if (!cell)
    throw new Error('XhCalendarCellTrigger 要放在 XhCalendarCell 里')
  return cell
}
