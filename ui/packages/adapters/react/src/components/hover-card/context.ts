/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { HoverCardContext } from './use-hover-card'
import { createContext, useContext } from 'react'

const Ctx = createContext<HoverCardContext | undefined>(undefined)

export const HoverCardProvider = Ctx

export function useHoverCardContext(): HoverCardContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhHoverCard 的部件要放在 XhHoverCardRoot 里')
  return ctx
}
