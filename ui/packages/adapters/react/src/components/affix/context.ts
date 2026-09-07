import type { AffixContext } from './use-affix'
import { createContext, useContext } from 'react'

const Ctx = createContext<AffixContext | undefined>(undefined)

export const AffixProvider = Ctx

export function useAffixContext(): AffixContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAffix 的部件要放在 XhAffixRoot 里')
  return ctx
}
