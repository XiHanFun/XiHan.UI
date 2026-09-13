/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { AvatarContext } from './use-avatar'
import { createContext, useContext } from 'react'

const Ctx = createContext<AvatarContext | undefined>(undefined)

export const AvatarProvider = Ctx

export function useAvatarContext(): AvatarContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhAvatar 的部件要放在 XhAvatarRoot 里')
  return ctx
}
