import type { NumberFieldContext } from './use-number-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<NumberFieldContext | undefined>(undefined)

export const NumberFieldProvider = Ctx

export function useNumberFieldContext(): NumberFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhNumberField 的部件要放在 XhNumberFieldRoot 里')
  return ctx
}
