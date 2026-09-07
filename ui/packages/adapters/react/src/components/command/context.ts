import type { CommandGroupProps, CommandItemProps } from '@xihan-ui/headless'
import type { CommandContext } from './use-command'
import { createContext, useContext } from 'react'

const Ctx = createContext<CommandContext | undefined>(undefined)
const GroupCtx = createContext<CommandGroupProps | undefined>(undefined)
const ItemCtx = createContext<CommandItemProps | undefined>(undefined)

export const CommandProvider = Ctx
export const CommandGroupProvider = GroupCtx
export const CommandItemProvider = ItemCtx

export function useCommandContext(): CommandContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCommand 的部件要放在 XhCommandRoot 里')
  return ctx
}

export function useCommandGroupContext(): CommandGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhCommandGroupLabel 要放在 XhCommandGroup 里')
  return group
}

export function useCommandItemContext(): CommandItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('条目的子部件要放在 XhCommandItem 里')
  return item
}
