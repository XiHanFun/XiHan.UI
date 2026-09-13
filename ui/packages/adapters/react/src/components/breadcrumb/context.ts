/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { BreadcrumbContext } from './use-breadcrumb'
import { createContext, useContext } from 'react'

const Ctx = createContext<BreadcrumbContext | undefined>(undefined)

export const BreadcrumbProvider = Ctx

export function useBreadcrumbContext(): BreadcrumbContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhBreadcrumb 的部件要放在 XhBreadcrumbRoot 里')
  return ctx
}
