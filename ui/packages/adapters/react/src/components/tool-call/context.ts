import type { ToolCallContext } from './use-tool-call'
import { createContext, useContext } from 'react'

const Ctx = createContext<ToolCallContext | undefined>(undefined)

export const ToolCallProvider = Ctx

export function useToolCallContext(): ToolCallContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhToolCall 的部件要放在 XhToolCallRoot 里')
  return ctx
}
