/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CardApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface CardContext {
  api: CardApi
}

const Ctx = createContext<CardContext | undefined>(undefined)

export const CardProvider = Ctx

export function useCardContext(): CardContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCard 的部件要放在 XhCardRoot 里')
  return ctx
}
