/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { PaginationContext } from './use-pagination'
import { createContext, useContext } from 'react'

const Ctx = createContext<PaginationContext | undefined>(undefined)

export const PaginationProvider = Ctx

export function usePaginationContext(): PaginationContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPagination 的部件要放在 XhPaginationRoot 里')
  return ctx
}
