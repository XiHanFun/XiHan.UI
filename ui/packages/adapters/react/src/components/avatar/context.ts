import type { AvatarContext } from './use-avatar'
import { createContext, useContext } from 'react'

const Ctx = createContext<AvatarContext | undefined>(undefined)

export const AvatarProvider = Ctx

export function useAvatarContext(): AvatarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAvatar 的部件要放在 XhAvatarRoot 里')
  return ctx
}
