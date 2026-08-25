import type { MenubarContentProps, MenubarGroupProps, MenubarItemProps, MenubarSelectDetails } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { MenubarContext } from './use-menubar'
import { inject, provide } from 'vue'

/** 某一项菜单自报的身份，供它的 positioner / content 取到同一个值（两者与 trigger 靠它互相认领）。 */
export interface MenubarMenuContext {
  menu: ComputedRef<MenubarContentProps>
}

/** 条目自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
export interface MenubarItemContext {
  item: ComputedRef<MenubarItemProps>
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface MenubarGroupContext {
  group: ComputedRef<MenubarGroupProps>
}

const KEY: InjectionKey<MenubarContext> = Symbol.for('xh-menubar')
const MENU_KEY: InjectionKey<MenubarMenuContext> = Symbol.for('xh-menubar-menu')
const ITEM_KEY: InjectionKey<MenubarItemContext> = Symbol.for('xh-menubar-item')
const GROUP_KEY: InjectionKey<MenubarGroupContext> = Symbol.for('xh-menubar-group')

export function provideMenubar(ctx: MenubarContext): void {
  provide(KEY, ctx)
}

export function useMenubarContext(): MenubarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Menubar 部件必须用在 XhMenubarRoot 内')
  return ctx
}

export function provideMenubarMenu(ctx: MenubarMenuContext): void {
  provide(MENU_KEY, ctx)
}

/** 取所属那一项的身份，不在 positioner 内时返回 null（此时 content 须自带 value）。 */
export function useMenubarMenuContext(): MenubarMenuContext | null {
  return inject(MENU_KEY, null)
}

export function provideMenubarItem(ctx: MenubarItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useMenubarItemContext(): MenubarItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Menubar 条目子部件必须用在 XhMenubarItem 内')
  return ctx
}

export function provideMenubarGroup(ctx: MenubarGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useMenubarGroupContext(): MenubarGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] Menubar 分组标题必须用在 XhMenubarGroup 内')
  return ctx
}

/** 选中链：子菜单任意层级的选中都汇到根——先发根的 select，再关根，各级随父关闭级联收起。 */
export interface MenubarChain {
  notifySelect: (details: MenubarSelectDetails) => void
}

const CHAIN_KEY: InjectionKey<MenubarChain> = Symbol.for('xh-menubar-chain')

export function provideMenubarChain(chain: MenubarChain): void {
  provide(CHAIN_KEY, chain)
}

export function useMenubarChain(): MenubarChain {
  const chain = inject(CHAIN_KEY, null)
  if (!chain)
    throw new Error('[xh] MenubarSub 必须用在 XhMenubarRoot 内')
  return chain
}

/** 子菜单触发条目要同时够到父菜单栏与本子菜单，这里存父层句柄与它在父层里的身份。 */
export interface MenubarSubHandle {
  parent: MenubarContext
  value: string
  disabled?: boolean
}

const SUB_KEY: InjectionKey<MenubarSubHandle> = Symbol.for('xh-menubar-sub')

export function provideMenubarSub(handle: MenubarSubHandle): void {
  provide(SUB_KEY, handle)
}

export function useMenubarSubContext(): MenubarSubHandle {
  const handle = inject(SUB_KEY, null)
  if (!handle)
    throw new Error('[xh] MenubarSubTrigger 必须用在 XhMenubarSub 内')
  return handle
}
