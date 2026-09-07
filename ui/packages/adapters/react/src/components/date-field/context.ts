import type { DateFieldContext } from './use-date-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<DateFieldContext | undefined>(undefined)

export const DateFieldProvider = Ctx

export function useDateFieldContext(): DateFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('DateField 的部件要放在 XhDateFieldRoot 里')
  return ctx
}
