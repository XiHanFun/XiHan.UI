import type { CollapsibleContext } from './use-collapsible'
import { createContext, useContext } from 'react'

const Ctx = createContext<CollapsibleContext | undefined>(undefined)

export const CollapsibleProvider = Ctx

export function useCollapsibleContext(): CollapsibleContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCollapsible 的部件要放在 XhCollapsibleRoot 里')
  return ctx
}
