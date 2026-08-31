import type { InjectionKey } from 'vue'
import type { PromptInputContext } from './use-prompt-input'
import { inject, provide } from 'vue'

const KEY: InjectionKey<PromptInputContext> = Symbol.for('xh-prompt-input')

export function providePromptInput(ctx: PromptInputContext): void {
  provide(KEY, ctx)
}

export function usePromptInputContext(): PromptInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] PromptInput 部件必须用在 XhPromptInputRoot 内')
  return ctx
}
