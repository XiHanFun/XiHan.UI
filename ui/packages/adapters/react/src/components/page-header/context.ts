import type { PageHeaderApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface PageHeaderContext {
  api: PageHeaderApi
}

const Ctx = createContext<PageHeaderContext | undefined>(undefined)

export const PageHeaderProvider = Ctx

export function usePageHeaderContext(): PageHeaderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPageHeader 的部件要放在 XhPageHeaderRoot 里')
  return ctx
}
