/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { RatingContext } from './use-rating'
import { createContext, useContext } from 'react'

const Ctx = createContext<RatingContext | undefined>(undefined)

export const RatingProvider = Ctx

export function useRatingContext(): RatingContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhRating 的部件要放在 XhRatingRoot 里')
  return ctx
}
