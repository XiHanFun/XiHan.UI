/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { DiffViewContext } from './use-diff-view'
import { createContext, useContext } from 'react'

const Ctx = createContext<DiffViewContext | undefined>(undefined)

export const DiffViewProvider = Ctx

export function useDiffViewContext(): DiffViewContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhDiffView 的部件要放在 XhDiffViewRoot 里')
  return ctx
}
