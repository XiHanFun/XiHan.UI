/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ToolbarContext } from './use-toolbar'
import { createContext, useContext } from 'react'

const Ctx = createContext<ToolbarContext | undefined>(undefined)

export const ToolbarProvider = Ctx

export function useToolbarContext(): ToolbarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhToolbar 的部件要放在 XhToolbarRoot 里')
  return ctx
}
