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

/** 选中链：子菜单任意层级的选中都汇到根——先发根的 select，再关根，各级随父关闭级联收起。 */
export interface ContextMenuChain {
  notifySelect: (details: { value: string }) => void
}

const CHAIN_KEY: InjectionKey<ContextMenuChain> = Symbol.for('xh-context-menu-chain')

export function provideContextMenuChain(chain: ContextMenuChain): void {
  provide(CHAIN_KEY, chain)
}

export function useContextMenuChain(): ContextMenuChain {
  const chain = inject(CHAIN_KEY, null)
  if (!chain)
    throw new Error('[xh] ContextMenuSub 必须用在 XhContextMenuRoot 内')
  return chain
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
