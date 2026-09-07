import type { BadgeApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface BadgeContext {
  api: BadgeApi
}

const Ctx = createContext<BadgeContext | undefined>(undefined)

export const BadgeProvider = Ctx

export function useBadgeContext(): BadgeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhBadge 的部件要放在 XhBadgeRoot 里')
  return ctx
}
