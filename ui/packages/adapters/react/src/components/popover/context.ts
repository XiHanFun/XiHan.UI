import type { PopoverContext } from './use-popover'
import { createContext, useContext } from 'react'

const Ctx = createContext<PopoverContext | undefined>(undefined)

export const PopoverProvider = Ctx

export function usePopoverContext(): PopoverContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPopover 的部件要放在 XhPopoverRoot 里')
  return ctx
}
