import type { ContextMenuGroupProps, ContextMenuItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ContextMenuContext } from './use-context-menu'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 item-text / item-indicator 这类子部件复用同一份声明。 */
export interface ContextMenuItemContext {
  item: ComputedRef<ContextMenuItemProps>
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface ContextMenuGroupContext {
  group: ComputedRef<ContextMenuGroupProps>
}

const KEY: InjectionKey<ContextMenuContext> = Symbol.for('xh-context-menu')
const ITEM_KEY: InjectionKey<ContextMenuItemContext> = Symbol.for('xh-context-menu-item')
const GROUP_KEY: InjectionKey<ContextMenuGroupContext> = Symbol.for('xh-context-menu-group')

export function provideContextMenu(ctx: ContextMenuContext): void {
  provide(KEY, ctx)
}

export function useContextMenuContext(): ContextMenuContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ContextMenu 部件必须用在 XhContextMenuRoot 内')
  return ctx
}

export function provideContextMenuItem(ctx: ContextMenuItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useContextMenuItemContext(): ContextMenuItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] ContextMenu 条目子部件必须用在 XhContextMenuItem 内')
  return ctx
}

export function provideContextMenuGroup(ctx: ContextMenuGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useContextMenuGroupContext(): ContextMenuGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] ContextMenu 分组标题必须用在 XhContextMenuGroup 内')
  return ctx
}

/** 子菜单触发条目要同时够到父右键菜单与本子菜单，这里存父层句柄与它在父层里的身份。 */
export interface ContextMenuSubHandle {
  parent: ContextMenuContext
  value: string
  disabled?: boolean
}

const SUB_KEY: InjectionKey<ContextMenuSubHandle> = Symbol.for('xh-context-menu-sub')

export function provideContextMenuSub(handle: ContextMenuSubHandle): void {
  provide(SUB_KEY, handle)
}

export function useContextMenuSubContext(): ContextMenuSubHandle {
  const handle = inject(SUB_KEY, null)
  if (!handle)
    throw new Error('[xh] ContextMenuSubTrigger 必须用在 XhContextMenuSub 内')
  return handle
}
