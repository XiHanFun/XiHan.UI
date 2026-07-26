import type { InjectionKey } from 'vue'
import type { TabsContext } from './use-tabs'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TabsContext> = Symbol('xh-tabs')

export function provideTabs(ctx: TabsContext): void {
  provide(KEY, ctx)
}

export function useTabsContext(): TabsContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tabs 部件必须用在 XhTabsRoot 内')
  return ctx
}
