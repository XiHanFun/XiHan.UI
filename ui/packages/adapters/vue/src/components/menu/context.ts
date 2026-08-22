import type { MenuGroupProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { MenuContext } from './use-menu'
import { inject, provide } from 'vue'

const KEY: InjectionKey<MenuContext> = Symbol('xh-menu')

export function provideMenu(ctx: MenuContext): void {
  provide(KEY, ctx)
}

export function useMenuContext(): MenuContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Menu 部件必须用在 XhMenuRoot 内')
  return ctx
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface MenuGroupContext {
  group: ComputedRef<MenuGroupProps>
}

const GROUP_KEY: InjectionKey<MenuGroupContext> = Symbol('xh-menu-group')

export function provideMenuGroup(ctx: MenuGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useMenuGroupContext(): MenuGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] Menu 分组标题必须用在 XhMenuGroup 内')
  return ctx
}

/** 选中链：任意层级的选中都汇到根——先发根的 select，再关根，各级子层随父关闭级联收起。 */
export interface MenuChain {
  notifySelect: (details: { value: string }) => void
}

const CHAIN_KEY: InjectionKey<MenuChain> = Symbol('xh-menu-chain')

export function provideMenuChain(chain: MenuChain): void {
  provide(CHAIN_KEY, chain)
}

export function useMenuChain(): MenuChain {
  const chain = inject(CHAIN_KEY, null)
  if (!chain)
    throw new Error('[xh] MenuSub 必须用在 XhMenuRoot 内')
  return chain
}

/** 子菜单触发条目要同时够到父菜单与本子菜单，这里存父层句柄与它在父层里的身份。 */
export interface MenuSubHandle {
  parent: MenuContext
  value: string
  disabled?: boolean
}

const SUB_KEY: InjectionKey<MenuSubHandle> = Symbol('xh-menu-sub')

export function provideMenuSub(handle: MenuSubHandle): void {
  provide(SUB_KEY, handle)
}

export function useMenuSubContext(): MenuSubHandle {
  const handle = inject(SUB_KEY, null)
  if (!handle)
    throw new Error('[xh] MenuSubTrigger 必须用在 XhMenuSub 内')
  return handle
}
