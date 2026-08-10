import type { InjectionKey } from 'vue'
import type { VirtualizerContext } from './use-virtualizer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<VirtualizerContext> = Symbol('xh-virtualizer')

export function provideVirtualizer(ctx: VirtualizerContext): void {
  provide(KEY, ctx)
}

export function useVirtualizerContext(): VirtualizerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Virtualizer 部件必须用在 XhVirtualizerRoot 内')
  return ctx
}
