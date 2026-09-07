import type { NavigationMenuContext } from './use-navigation-menu'
import { createContext, useContext } from 'react'

const Ctx = createContext<NavigationMenuContext | undefined>(undefined)

export const NavigationMenuProvider = Ctx

export function useNavigationMenuContext(): NavigationMenuContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhNavigationMenu 的部件要放在 XhNavigationMenuRoot 里')
  return ctx
}
