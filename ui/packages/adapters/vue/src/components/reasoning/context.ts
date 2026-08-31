import type { InjectionKey } from 'vue'
import type { ReasoningContext } from './use-reasoning'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ReasoningContext> = Symbol.for('xh-reasoning')

export function provideReasoning(ctx: ReasoningContext): void {
  provide(KEY, ctx)
}

export function useReasoningContext(): ReasoningContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Reasoning 部件必须用在 XhReasoningRoot 内')
  return ctx
}
