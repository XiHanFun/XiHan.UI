import type { InjectionKey } from 'vue'
import type { BackTopContext } from './use-back-top'
import { inject, provide } from 'vue'

const KEY: InjectionKey<BackTopContext> = Symbol('xh-back-top')

export function provideBackTop(ctx: BackTopContext): void {
  provide(KEY, ctx)
}

export function useBackTopContext(): BackTopContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] BackTop 部件必须用在 XhBackTopRoot 内')
  return ctx
}
