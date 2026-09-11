import type { MenubarContentProps, MenubarGroupProps, MenubarItemProps } from '@xihan-ui/headless'
import type { MenubarContext } from './use-menubar'
import { createContext, useContext } from 'react'

const Ctx = createContext<MenubarContext | undefined>(undefined)

export const MenubarProvider = Ctx

export function useMenubarContext(): MenubarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhMenubar 的部件要放在 XhMenubarRoot 里')
  return ctx
}

/** 某一项菜单自报的身份，供它的 content 与 arrow 取到同一个值（两者与 trigger 靠它互相认领）。 */
const MenuCtx = createContext<MenubarContentProps | undefined>(undefined)

export const MenubarMenuProvider = MenuCtx

/** 取所属那一项的身份，不在 positioner 内时返回 null（此时 content 须自带 value）。 */
export function useMenubarMenuContext(): MenubarContentProps | null {
  return useContext(MenuCtx) ?? null
}

/** 条目自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
const ItemCtx = createContext<MenubarItemProps | undefined>(undefined)

export const MenubarItemProvider = ItemCtx

export function useMenubarItemContext(): MenubarItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('XhMenubar 的条目子部件要放在 XhMenubarItem 里')
  return item
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
const GroupCtx = createContext<MenubarGroupProps | undefined>(undefined)

export const MenubarGroupProvider = GroupCtx

export function useMenubarGroupContext(): MenubarGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhMenubar 的分组标题要放在 XhMenubarGroup 里')
  return group
}

/** 子菜单触发条目要同时够到父菜单栏与本子菜单，这里存父层句柄与它在父层里的身份。 */
export interface MenubarSubHandle {
  parent: MenubarContext
  value: string
  disabled?: boolean
}

const SubCtx = createContext<MenubarSubHandle | undefined>(undefined)

export const MenubarSubProvider = SubCtx

export function useMenubarSubContext(): MenubarSubHandle {
  const handle = useContext(SubCtx)
  if (!handle)
    throw new Error('XhMenubarSubTrigger 要放在 XhMenubarSub 里')
  return handle
}
