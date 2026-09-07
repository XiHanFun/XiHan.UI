import type { AvatarGroupApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface AvatarGroupContext {
  api: AvatarGroupApi
}

const Ctx = createContext<AvatarGroupContext | undefined>(undefined)

export const AvatarGroupProvider = Ctx

export function useAvatarGroupContext(): AvatarGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAvatarGroup 的部件要放在 XhAvatarGroupRoot 里')
  return ctx
}
