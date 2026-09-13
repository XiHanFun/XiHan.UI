/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InfiniteScrollContext } from './use-infinite-scroll'
import { createContext, useContext } from 'react'

const Ctx = createContext<InfiniteScrollContext | undefined>(undefined)

export const InfiniteScrollProvider = Ctx

export function useInfiniteScrollContext(): InfiniteScrollContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhInfiniteScroll 的部件要放在 XhInfiniteScrollRoot 里')
  return ctx
}
