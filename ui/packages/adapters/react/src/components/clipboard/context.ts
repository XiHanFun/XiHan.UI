import type { ClipboardContext } from './use-clipboard'
import { createContext, useContext } from 'react'

const Ctx = createContext<ClipboardContext | undefined>(undefined)

export const ClipboardProvider = Ctx

export function useClipboardContext(): ClipboardContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhClipboard 的部件要放在 XhClipboardRoot 里')
  return ctx
}
