/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { AvatarGroupApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface AvatarGroupContext {
  api: AvatarGroupApi
}

const Ctx = createContext<AvatarGroupContext | undefined>(undefined)

export const AvatarGroupProvider = Ctx

export function useAvatarGroupContext(): AvatarGroupContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAvatarGroup 的部件要放在 XhAvatarGroupRoot 里')
  return ctx
}
