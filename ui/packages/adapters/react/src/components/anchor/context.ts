import type { AnchorContext } from './use-anchor'
import { createContext, useContext } from 'react'

const Ctx = createContext<AnchorContext | undefined>(undefined)

export const AnchorProvider = Ctx

export function useAnchorContext(): AnchorContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAnchor 的部件要放在 XhAnchorRoot 里')
  return ctx
}
