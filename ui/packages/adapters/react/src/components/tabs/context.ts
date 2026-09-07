import type { TabsContext } from './use-tabs'
import { createContext, useContext } from 'react'

const Ctx = createContext<TabsContext | undefined>(undefined)

export const TabsProvider = Ctx

export function useTabsContext(): TabsContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTabs 的部件要放在 XhTabsRoot 里')
  return ctx
}
