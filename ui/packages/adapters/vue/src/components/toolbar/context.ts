import type { InjectionKey } from 'vue'
import type { ToolbarContext } from './use-toolbar'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToolbarContext> = Symbol('xh-toolbar')

export function provideToolbar(ctx: ToolbarContext): void {
  provide(KEY, ctx)
}

export function useToolbarContext(): ToolbarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Toolbar 部件必须用在 XhToolbarRoot 内')
  return ctx
}
