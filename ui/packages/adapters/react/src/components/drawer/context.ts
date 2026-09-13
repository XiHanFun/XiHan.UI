/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { DrawerContext } from './use-drawer'
import { createContext, useContext } from 'react'

const Ctx = createContext<DrawerContext | undefined>(undefined)

export const DrawerProvider = Ctx

export function useDrawerContext(): DrawerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhDrawer 的部件要放在 XhDrawerRoot 里')
  return ctx
}
