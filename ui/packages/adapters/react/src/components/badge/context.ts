/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { BadgeApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface BadgeContext {
  api: BadgeApi
}

const Ctx = createContext<BadgeContext | undefined>(undefined)

export const BadgeProvider = Ctx

export function useBadgeContext(): BadgeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhBadge 的部件要放在 XhBadgeRoot 里')
  return ctx
}
