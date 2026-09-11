import type { ContextMenuGroupProps, ContextMenuItemProps } from '@xihan-ui/headless'
import type { ContextMenuContext } from './use-context-menu'
import { createContext, useContext } from 'react'

const Ctx = createContext<ContextMenuContext | undefined>(undefined)

export const ContextMenuProvider = Ctx

export function useContextMenuContext(): ContextMenuContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhContextMenu 的部件要放在 XhContextMenuRoot 里')
  return ctx
}

/** 条目自报的值与禁用，供 item-text / item-indicator / item-description 复用同一份声明。 */
const ItemCtx = createContext<ContextMenuItemProps | undefined>(undefined)

export const ContextMenuItemProvider = ItemCtx

export function useContextMenuItemContext(): ContextMenuItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('XhContextMenu 的条目子部件要放在 XhContextMenuItem 里')
  return item
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
const GroupCtx = createContext<ContextMenuGroupProps | undefined>(undefined)

export const ContextMenuGroupProvider = GroupCtx

export function useContextMenuGroupContext(): ContextMenuGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhContextMenu 的分组标题要放在 XhContextMenuGroup 里')
  return group
}

/** 子菜单触发条目要同时够到父右键菜单与本子菜单，这里存父层句柄与它在父层里的身份。 */
export interface ContextMenuSubHandle {
  parent: ContextMenuContext
  value: string
  disabled?: boolean
}

const SubCtx = createContext<ContextMenuSubHandle | undefined>(undefined)

export const ContextMenuSubProvider = SubCtx

export function useContextMenuSubContext(): ContextMenuSubHandle {
  const handle = useContext(SubCtx)
  if (!handle)
    throw new Error('XhContextMenuSubTrigger 要放在 XhContextMenuSub 里')
  return handle
}
