import type { ScrollbarContext } from './use-scrollbar'
import { createContext, useContext } from 'react'

const Ctx = createContext<ScrollbarContext | undefined>(undefined)

export const ScrollbarProvider = Ctx

export function useScrollbarContext(): ScrollbarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhScrollbar 的部件要放在 XhScrollbarRoot 里')
  return ctx
}
