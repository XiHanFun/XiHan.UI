import type { InjectionKey } from 'vue'
import type { ToggleGroupContext } from './use-toggle-group'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToggleGroupContext> = Symbol('xh-toggle-group')

export function provideToggleGroup(ctx: ToggleGroupContext): void {
  provide(KEY, ctx)
}

export function useToggleGroupContext(): ToggleGroupContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ToggleGroup 部件必须用在 XhToggleGroupRoot 内')
  return ctx
}
