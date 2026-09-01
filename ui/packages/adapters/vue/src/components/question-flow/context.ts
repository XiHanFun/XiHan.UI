import type { InjectionKey } from 'vue'
import type { QuestionFlowContext } from './use-question-flow'
import { inject, provide } from 'vue'

const KEY: InjectionKey<QuestionFlowContext> = Symbol.for('xh-question-flow')

export function provideQuestionFlow(ctx: QuestionFlowContext): void {
  provide(KEY, ctx)
}

export function useQuestionFlowContext(): QuestionFlowContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] QuestionFlow 部件必须用在 XhQuestionFlowRoot 内')
  return ctx
}
