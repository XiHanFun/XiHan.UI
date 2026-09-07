import type { LayoutContext } from './use-layout'
import { createContext, useContext } from 'react'

const Ctx = createContext<LayoutContext | undefined>(undefined)

export const LayoutProvider = Ctx

export function useLayoutContext(): LayoutContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhLayout 的部件要放在 XhLayoutRoot 里')
  return ctx
}
