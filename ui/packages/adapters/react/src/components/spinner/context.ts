import type { SpinnerContext } from './use-spinner'
import { createContext, useContext } from 'react'

const Ctx = createContext<SpinnerContext | undefined>(undefined)

export const SpinnerProvider = Ctx

export function useSpinnerContext(): SpinnerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSpinner 的部件要放在 XhSpinner 里')
  return ctx
}
