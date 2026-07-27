import type { InjectionKey } from 'vue'
import type { DrawerContext } from './use-drawer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<DrawerContext> = Symbol('xh-drawer')

export function provideDrawer(ctx: DrawerContext): void {
  provide(KEY, ctx)
}

export function useDrawerContext(): DrawerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Drawer 部件必须用在 XhDrawerRoot 内')
  return ctx
}
