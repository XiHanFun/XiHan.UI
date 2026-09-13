/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { VirtualizerContext } from './use-virtualizer'
import { createContext, useContext } from 'react'

const Ctx = createContext<VirtualizerContext | undefined>(undefined)

export const VirtualizerProvider = Ctx

export function useVirtualizerContext(): VirtualizerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhVirtualizer 的部件要放在 XhVirtualizerRoot 里')
  return ctx
}
