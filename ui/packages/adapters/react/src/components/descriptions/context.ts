import type { DescriptionsApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface DescriptionsContext {
  api: DescriptionsApi
}

const Ctx = createContext<DescriptionsContext | undefined>(undefined)

export const DescriptionsProvider = Ctx

export function useDescriptionsContext(): DescriptionsContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhDescriptions 的部件要放在 XhDescriptionsRoot 里')
  return ctx
}
