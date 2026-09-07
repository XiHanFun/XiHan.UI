import type { ToggleGroupContext } from './use-toggle-group'
import { createContext, useContext } from 'react'

const Ctx = createContext<ToggleGroupContext | undefined>(undefined)

export const ToggleGroupProvider = Ctx

export function useToggleGroupContext(): ToggleGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhToggleGroup 的部件要放在 XhToggleGroupRoot 里')
  return ctx
}
