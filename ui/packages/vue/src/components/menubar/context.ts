import type { MenubarContentProps, MenubarGroupProps, MenubarItemProps } from '@xihan-ui/headless'
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

const KEY: InjectionKey<MenubarContext> = Symbol('xh-menubar')
const MENU_KEY: InjectionKey<MenubarMenuContext> = Symbol('xh-menubar-menu')
const ITEM_KEY: InjectionKey<MenubarItemContext> = Symbol('xh-menubar-item')
const GROUP_KEY: InjectionKey<MenubarGroupContext> = Symbol('xh-menubar-group')

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

/**
 * 取所属那一项的身份；不在 positioner 内时返回 null。
 * positioner 本身可缺省（作者直接把 content 挂在 root 下），那种写法要求 content 自带 value。
 */
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
