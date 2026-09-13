/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { QuestionFlowContext } from './use-question-flow'
import { createContext, useContext } from 'react'

const Ctx = createContext<QuestionFlowContext | undefined>(undefined)

export const QuestionFlowProvider = Ctx

export function useQuestionFlowContext(): QuestionFlowContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhQuestionFlow 的部件要放在 XhQuestionFlowRoot 里')
  return ctx
}
