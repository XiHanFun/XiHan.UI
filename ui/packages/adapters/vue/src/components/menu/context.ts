import type { InjectionKey } from 'vue'
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
