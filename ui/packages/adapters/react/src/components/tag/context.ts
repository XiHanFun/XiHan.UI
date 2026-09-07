import type { TagContext } from './use-tag'
import { createContext, useContext } from 'react'

const Ctx = createContext<TagContext | undefined>(undefined)

export const TagProvider = Ctx

export function useTagContext(): TagContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTag 的部件要放在 XhTagRoot 里')
  return ctx
}
