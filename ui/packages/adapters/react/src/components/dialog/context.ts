import type { DialogContext } from './use-dialog'
import { createContext, useContext } from 'react'

const Ctx = createContext<DialogContext | undefined>(undefined)

export const DialogProvider = Ctx

export function useDialogContext(): DialogContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhDialog 的部件要放在 XhDialogRoot 里')
  return ctx
}
