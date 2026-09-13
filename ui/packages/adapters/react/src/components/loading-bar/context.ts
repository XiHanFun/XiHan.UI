/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { LoadingBarContext } from './use-loading-bar'
import { createContext, useContext } from 'react'

const Ctx = createContext<LoadingBarContext | undefined>(undefined)

export const LoadingBarProvider = Ctx

export function useLoadingBarContext(): LoadingBarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhLoadingBar 的部件要放在 XhLoadingBarRoot 里')
  return ctx
}
