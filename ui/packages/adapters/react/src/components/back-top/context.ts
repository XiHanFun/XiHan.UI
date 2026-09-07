import type { BackTopContext } from './use-back-top'
import { createContext, useContext } from 'react'

const Ctx = createContext<BackTopContext | undefined>(undefined)

export const BackTopProvider = Ctx

export function useBackTopContext(): BackTopContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhBackTop 的部件要放在 XhBackTopRoot 里')
  return ctx
}
