import type { ResizableContext } from './use-resizable'
import { createContext, useContext } from 'react'

const Ctx = createContext<ResizableContext | undefined>(undefined)

export const ResizableProvider = Ctx

export function useResizableContext(): ResizableContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhResizable 的部件要放在 XhResizableRoot 里')
  return ctx
}
