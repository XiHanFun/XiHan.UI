/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SpinnerContext } from './use-spinner'
import { createContext, useContext } from 'react'

const Ctx = createContext<SpinnerContext | undefined>(undefined)

export const SpinnerProvider = Ctx

export function useSpinnerContext(): SpinnerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSpinner 的部件要放在 XhSpinner 里')
  return ctx
}
