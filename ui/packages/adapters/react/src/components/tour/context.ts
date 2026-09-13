/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TourContext } from './use-tour'
import { createContext, useContext } from 'react'

const Ctx = createContext<TourContext | undefined>(undefined)

export const TourProvider = Ctx

export function useTourContext(): TourContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTour 的部件要放在 XhTourRoot 里')
  return ctx
}
