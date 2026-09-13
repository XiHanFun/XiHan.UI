/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SortableContext } from './use-sortable'
import { createContext, useContext } from 'react'

const Ctx = createContext<SortableContext | undefined>(undefined)

export const SortableProvider = Ctx

export function useSortableContext(): SortableContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSortable 的部件要放在 XhSortableRoot 里')
  return ctx
}
