import type { InjectionKey } from 'vue'
import type { ComposerContext } from './use-composer'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ComposerContext> = Symbol('xh-composer')

export function provideComposer(ctx: ComposerContext): void {
  provide(KEY, ctx)
}

export function useComposerContext(): ComposerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Composer 部件必须用在 XhComposerRoot 内')
  return ctx
}
