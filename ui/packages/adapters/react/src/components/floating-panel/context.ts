/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FloatingPanelContext } from './use-floating-panel'
import { createContext, useContext } from 'react'

const Ctx = createContext<FloatingPanelContext | undefined>(undefined)

export const FloatingPanelProvider = Ctx

export function useFloatingPanelContext(): FloatingPanelContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFloatingPanel 的部件要放在 XhFloatingPanelRoot 里')
  return ctx
}
