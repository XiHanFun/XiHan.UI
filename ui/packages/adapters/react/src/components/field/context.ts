import type { FieldContext } from './use-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<FieldContext | undefined>(undefined)

export const FieldProvider = Ctx

/** 不在字段里时返回 undefined，薄封装照样能单独用。 */
export function useOptionalFieldContext(): FieldContext | undefined {
  return useContext(Ctx)
}

export function useFieldContext(): FieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhField 的部件要放在 XhFieldRoot 里')
  return ctx
}
