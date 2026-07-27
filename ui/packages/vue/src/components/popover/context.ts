import type { InjectionKey } from 'vue'
import type { PopoverContext } from './use-popover'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PopoverContext> = Symbol('xh-popover')

export function providePopover(ctx: PopoverContext): void {
  provide(KEY, ctx)
}

export function usePopoverContext(): PopoverContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Popover 部件必须用在 XhPopoverRoot 内')
  return ctx
}
