import type { BreadcrumbContext } from './use-breadcrumb'
import { createContext, useContext } from 'react'

const Ctx = createContext<BreadcrumbContext | undefined>(undefined)

export const BreadcrumbProvider = Ctx

export function useBreadcrumbContext(): BreadcrumbContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhBreadcrumb 的部件要放在 XhBreadcrumbRoot 里')
  return ctx
}
