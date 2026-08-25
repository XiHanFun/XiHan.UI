import type { InjectionKey } from 'vue'
import type { NavigationMenuContext } from './use-navigation-menu'
import { inject, provide } from 'vue'

const KEY: InjectionKey<NavigationMenuContext> = Symbol.for('xh-navigation-menu')

export function provideNavigationMenu(ctx: NavigationMenuContext): void {
  provide(KEY, ctx)
}

export function useNavigationMenuContext(): NavigationMenuContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] NavigationMenu 部件必须用在 XhNavigationMenuRoot 内')
  return ctx
}
