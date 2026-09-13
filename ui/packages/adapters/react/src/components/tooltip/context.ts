/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TooltipContext } from './use-tooltip'
import { createContext, useContext } from 'react'

const Ctx = createContext<TooltipContext | undefined>(undefined)

export const TooltipProvider = Ctx

export function useTooltipContext(): TooltipContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTooltip 的部件要放在 XhTooltipRoot 里')
  return ctx
}
