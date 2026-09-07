import type { PromptInputContext } from './use-prompt-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<PromptInputContext | undefined>(undefined)

export const PromptInputProvider = Ctx

export function usePromptInputContext(): PromptInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPromptInput 的部件要放在 XhPromptInputRoot 里')
  return ctx
}
