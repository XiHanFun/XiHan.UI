/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ListApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface ListContext {
  api: ListApi
}

const Ctx = createContext<ListContext | undefined>(undefined)

export const ListProvider = Ctx

export function useListContext(): ListContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhList 的部件要放在 XhListRoot 里')
  return ctx
}
