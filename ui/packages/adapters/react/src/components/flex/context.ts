/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FlexApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface FlexContext {
  api: FlexApi
}

const Ctx = createContext<FlexContext | undefined>(undefined)

export const FlexProvider = Ctx

export function useFlexContext(): FlexContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFlex 的部件要放在 XhFlex 里')
  return ctx
}
