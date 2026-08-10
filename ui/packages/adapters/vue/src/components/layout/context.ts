import type { InjectionKey } from 'vue'
import type { LayoutContext } from './use-layout'
import { inject, provide } from 'vue'

const KEY: InjectionKey<LayoutContext> = Symbol('xh-layout')

export function provideLayout(ctx: LayoutContext): void {
  provide(KEY, ctx)
}

export function useLayoutContext(): LayoutContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Layout 部件必须用在 XhLayoutRoot 内')
  return ctx
}
