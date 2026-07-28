import type { InjectionKey } from 'vue'
import type { LoadingBarContext } from './use-loading-bar'
import { inject, provide } from 'vue'

const KEY: InjectionKey<LoadingBarContext> = Symbol('xh-loading-bar')

export function provideLoadingBar(ctx: LoadingBarContext): void {
  provide(KEY, ctx)
}

export function useLoadingBarContext(): LoadingBarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] LoadingBar 部件必须用在 XhLoadingBarRoot 内')
  return ctx
}
