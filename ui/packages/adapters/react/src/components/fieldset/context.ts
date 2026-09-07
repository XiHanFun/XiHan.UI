import type { FieldsetContext } from './use-fieldset'
import { createContext, useContext } from 'react'

const Ctx = createContext<FieldsetContext | undefined>(undefined)

export const FieldsetProvider = Ctx

export function useFieldsetContext(): FieldsetContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFieldset 的部件要放在 XhFieldsetRoot 里')
  return ctx
}
