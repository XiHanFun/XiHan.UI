/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { PageHeaderApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface PageHeaderContext {
  api: PageHeaderApi
}

const Ctx = createContext<PageHeaderContext | undefined>(undefined)

export const PageHeaderProvider = Ctx

export function usePageHeaderContext(): PageHeaderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPageHeader 的部件要放在 XhPageHeaderRoot 里')
  return ctx
}
