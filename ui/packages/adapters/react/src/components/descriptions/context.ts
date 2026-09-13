/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { DescriptionsApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface DescriptionsContext {
  api: DescriptionsApi
}

const Ctx = createContext<DescriptionsContext | undefined>(undefined)

export const DescriptionsProvider = Ctx

export function useDescriptionsContext(): DescriptionsContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhDescriptions 的部件要放在 XhDescriptionsRoot 里')
  return ctx
}
