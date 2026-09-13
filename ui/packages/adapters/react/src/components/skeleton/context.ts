/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SkeletonContext } from './use-skeleton'
import { createContext, useContext } from 'react'

const Ctx = createContext<SkeletonContext | undefined>(undefined)

export const SkeletonProvider = Ctx

export function useSkeletonContext(): SkeletonContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSkeleton 的部件要放在 XhSkeletonRoot 里')
  return ctx
}
