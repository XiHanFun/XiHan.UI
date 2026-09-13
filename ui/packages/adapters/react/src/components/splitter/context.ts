/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SplitterContext } from './use-splitter'
import { createContext, useContext } from 'react'

const Ctx = createContext<SplitterContext | undefined>(undefined)

export const SplitterProvider = Ctx

export function useSplitterContext(): SplitterContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSplitter 的部件要放在 XhSplitterRoot 里')
  return ctx
}
