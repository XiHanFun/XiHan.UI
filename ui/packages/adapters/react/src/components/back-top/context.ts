/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { BackTopContext } from './use-back-top'
import { createContext, useContext } from 'react'

const Ctx = createContext<BackTopContext | undefined>(undefined)

export const BackTopProvider = Ctx

export function useBackTopContext(): BackTopContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhBackTop 的部件要放在 XhBackTopRoot 里')
  return ctx
}
