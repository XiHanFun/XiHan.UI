import type { PinInputContext } from './use-pin-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<PinInputContext | undefined>(undefined)

export const PinInputProvider = Ctx

export function usePinInputContext(): PinInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPinInput 的部件要放在 XhPinInputRoot 里')
  return ctx
}
