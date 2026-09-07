import type { EditableContext } from './use-editable'
import { createContext, useContext } from 'react'

const Ctx = createContext<EditableContext | undefined>(undefined)

export const EditableProvider = Ctx

export function useEditableContext(): EditableContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhEditable 的部件要放在 XhEditableRoot 里')
  return ctx
}
