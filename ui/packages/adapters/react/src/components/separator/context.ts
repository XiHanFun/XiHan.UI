import type { SeparatorApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface SeparatorContext {
  api: SeparatorApi
}

const Ctx = createContext<SeparatorContext | undefined>(undefined)

export const SeparatorProvider = Ctx

export function useSeparatorContext(): SeparatorContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSeparator 的部件要放在 XhSeparatorRoot 里')
  return ctx
}
