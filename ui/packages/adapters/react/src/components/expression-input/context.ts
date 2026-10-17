/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ExpressionInputItem } from '@xihan-ui/headless'
import type { ExpressionInputContext } from './use-expression-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<ExpressionInputContext | undefined>(undefined)
const ItemCtx = createContext<ExpressionInputItem | undefined>(undefined)

export const ExpressionInputProvider = Ctx
export const ExpressionInputItemProvider = ItemCtx

export function useExpressionInputContext(): ExpressionInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhExpressionInput 的部件要放在 XhExpressionInputRoot 里')
  return ctx
}

export function useExpressionInputItemContext(): ExpressionInputItem {
  const item = useContext(ItemCtx)
  if (!item)
    throw new Error('补全条目的子部件要放在 XhExpressionInputItem 里')
  return item
}
