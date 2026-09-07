import type { DrawerContext } from './use-drawer'
import { createContext, useContext } from 'react'

const Ctx = createContext<DrawerContext | undefined>(undefined)

export const DrawerProvider = Ctx

export function useDrawerContext(): DrawerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhDrawer 的部件要放在 XhDrawerRoot 里')
  return ctx
}
