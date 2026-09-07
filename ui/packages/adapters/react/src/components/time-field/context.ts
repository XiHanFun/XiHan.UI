import type { TimeFieldContext } from './use-time-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<TimeFieldContext | undefined>(undefined)

export const TimeFieldProvider = Ctx

export function useTimeFieldContext(): TimeFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('TimeField 的部件要放在 XhTimeFieldRoot 里')
  return ctx
}
