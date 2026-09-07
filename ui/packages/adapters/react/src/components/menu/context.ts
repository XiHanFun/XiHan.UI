import type { MenuGroupProps, MenuItemProps, MenuSelectDetails } from '@xihan-ui/headless'
import type { MenuContext } from './use-menu'
import { createContext, useContext } from 'react'

const Ctx = createContext<MenuContext | undefined>(undefined)

export const MenuProvider = Ctx

export function useMenuContext(): MenuContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhMenu 的部件要放在 XhMenuRoot 里')
  return ctx
}

/** 条目自报的值与禁用，供 item-text / item-indicator / item-description 复用同一份声明。 */
const ItemCtx = createContext<MenuItemProps | undefined>(undefined)

export const MenuItemProvider = ItemCtx

export function useMenuItemContext(): MenuItemProps {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('XhMenu 的条目子部件要放在 XhMenuItem 里')
  return item
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
const GroupCtx = createContext<MenuGroupProps | undefined>(undefined)

export const MenuGroupProvider = GroupCtx

export function useMenuGroupContext(): MenuGroupProps {
  const group = useContext(GroupCtx)
  if (!group)
    throw new Error('XhMenu 的分组标题要放在 XhMenuGroup 里')
  return group
}

/** 选中链：任意层级的选中都汇到根——先发根的 select，再关根，各级子层随父关闭级联收起。 */
export interface MenuChain {
  notifySelect: (details: MenuSelectDetails) => void
}

const ChainCtx = createContext<MenuChain | undefined>(undefined)

export const MenuChainProvider = ChainCtx

export function useMenuChain(): MenuChain {
  const chain = useContext(ChainCtx)
  if (!chain)
    throw new Error('XhMenuSub 要放在 XhMenuRoot 里')
  return chain
}

/** 子菜单触发条目要同时够到父菜单与本子菜单，这里存父层句柄与它在父层里的身份。 */
export interface MenuSubHandle {
  parent: MenuContext
  value: string
  disabled?: boolean
}

const SubCtx = createContext<MenuSubHandle | undefined>(undefined)

export const MenuSubProvider = SubCtx

export function useMenuSubContext(): MenuSubHandle {
  const handle = useContext(SubCtx)
  if (!handle)
    throw new Error('XhMenuSubTrigger 要放在 XhMenuSub 里')
  return handle
}
