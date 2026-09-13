/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ToggleGroupContext } from './use-toggle-group'
import { createContext, useContext } from 'react'

const Ctx = createContext<ToggleGroupContext | undefined>(undefined)

export const ToggleGroupProvider = Ctx

export function useToggleGroupContext(): ToggleGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhToggleGroup 的部件要放在 XhToggleGroupRoot 里')
  return ctx
}
