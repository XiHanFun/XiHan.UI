/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { NavigationMenuContext } from './use-navigation-menu'
import { createContext, useContext } from 'react'

const Ctx = createContext<NavigationMenuContext | undefined>(undefined)

export const NavigationMenuProvider = Ctx

export function useNavigationMenuContext(): NavigationMenuContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhNavigationMenu 的部件要放在 XhNavigationMenuRoot 里')
  return ctx
}
