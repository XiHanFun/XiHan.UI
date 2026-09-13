/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FloatButtonContext } from './use-float-button'
import { createContext, useContext } from 'react'

const Ctx = createContext<FloatButtonContext | undefined>(undefined)

export const FloatButtonProvider = Ctx

export function useFloatButtonContext(): FloatButtonContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFloatButton 的部件要放在 XhFloatButtonRoot 里')
  return ctx
}
