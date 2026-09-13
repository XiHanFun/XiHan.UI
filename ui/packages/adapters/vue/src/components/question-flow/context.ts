/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

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
