/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { LayoutContext } from './use-layout'
import { createContext, useContext } from 'react'

const Ctx = createContext<LayoutContext | undefined>(undefined)

export const LayoutProvider = Ctx

export function useLayoutContext(): LayoutContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhLayout 的部件要放在 XhLayoutRoot 里')
  return ctx
}
