/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { GridListRowProps } from '@xihan-ui/headless'
import type { GridListContext } from './use-grid-list'
import { createContext, useContext } from 'react'

const Context = createContext<GridListContext | undefined>(undefined)
const RowContext = createContext<GridListRowProps | undefined>(undefined)

export const GridListProvider = Context
export const GridListRowProvider = RowContext

export function useGridListContext(): GridListContext {
  const context = useContext(Context)
  if (!context)
    throw new Error('XhGridList 的部件要放在 XhGridListRoot 内')
  return context
}

export function useGridListRow(): GridListRowProps {
  const row = useContext(RowContext)
  if (!row)
    throw new Error('GridList 行子部件要放在 XhGridListRow 内')
  return row
}
