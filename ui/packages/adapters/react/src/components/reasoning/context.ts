/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ReasoningContext } from './use-reasoning'
import { createContext, useContext } from 'react'

const Ctx = createContext<ReasoningContext | undefined>(undefined)

export const ReasoningProvider = Ctx

export function useReasoningContext(): ReasoningContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhReasoning 的部件要放在 XhReasoningRoot 里')
  return ctx
}
