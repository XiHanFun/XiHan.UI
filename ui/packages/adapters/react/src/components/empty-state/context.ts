import type { EmptyStateContext } from './use-empty-state'
import { createContext, useContext } from 'react'

const Ctx = createContext<EmptyStateContext | undefined>(undefined)

export const EmptyStateProvider = Ctx

export function useEmptyStateContext(): EmptyStateContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhEmptyState 的部件要放在 XhEmptyStateRoot 里')
  return ctx
}
