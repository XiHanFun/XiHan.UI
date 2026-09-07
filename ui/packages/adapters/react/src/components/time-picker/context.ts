import type { TimePickerColumnUnit } from '@xihan-ui/headless'
import type { TimePickerContext } from './use-time-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<TimePickerContext | undefined>(undefined)
/** 列自报的单位，供列内选项取到自己归哪一列。 */
const ColumnCtx = createContext<TimePickerColumnUnit | undefined>(undefined)

export const TimePickerProvider = Ctx
export const TimePickerColumnProvider = ColumnCtx

export function useTimePickerContext(): TimePickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('TimePicker 的部件要放在 XhTimePickerRoot 里')
  return ctx
}

export function useTimePickerColumnContext(): TimePickerColumnUnit {
  const unit = useContext(ColumnCtx)
  if (!unit)
    throw new Error('XhTimePickerItem 要放在 XhTimePickerColumn 里')
  return unit
}
