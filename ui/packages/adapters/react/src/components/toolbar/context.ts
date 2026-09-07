import type { ToolbarContext } from './use-toolbar'
import { createContext, useContext } from 'react'

const Ctx = createContext<ToolbarContext | undefined>(undefined)

export const ToolbarProvider = Ctx

export function useToolbarContext(): ToolbarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhToolbar 的部件要放在 XhToolbarRoot 里')
  return ctx
}
