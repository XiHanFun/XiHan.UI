import type { CommandGroupProps, CommandItemProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { CommandContext } from './use-command'
import { inject, provide } from 'vue'

/** 条目自报的值与禁用，供 item-text 这类子部件复用同一份声明。 */
export interface CommandItemContext {
  item: ComputedRef<CommandItemProps>
}

/** 分组自报的身份，供分组标题取到同一个值（标题的 id 由它派生）。 */
export interface CommandItemGroupContext {
  group: ComputedRef<CommandGroupProps>
}

const KEY: InjectionKey<CommandContext> = Symbol.for('xh-command')
const ITEM_KEY: InjectionKey<CommandItemContext> = Symbol.for('xh-command-item')
const GROUP_KEY: InjectionKey<CommandItemGroupContext> = Symbol.for('xh-command-item-group')

export function provideCommand(ctx: CommandContext): void {
  provide(KEY, ctx)
}

export function useCommandContext(): CommandContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Command 部件必须用在 XhCommandRoot 内')
  return ctx
}

export function provideCommandItem(ctx: CommandItemContext): void {
  provide(ITEM_KEY, ctx)
}

export function useCommandItemContext(): CommandItemContext {
  const ctx = inject(ITEM_KEY, null)
  if (!ctx)
    throw new Error('[xh] Command 条目子部件必须用在 XhCommandItem 内')
  return ctx
}

export function provideCommandItemGroup(ctx: CommandItemGroupContext): void {
  provide(GROUP_KEY, ctx)
}

export function useCommandItemGroupContext(): CommandItemGroupContext {
  const ctx = inject(GROUP_KEY, null)
  if (!ctx)
    throw new Error('[xh] Command 分组标题必须用在 XhCommandGroup 内')
  return ctx
}
