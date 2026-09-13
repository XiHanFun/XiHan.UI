/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { MarqueeApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface MarqueeContext {
  api: MarqueeApi
}

const Ctx = createContext<MarqueeContext | undefined>(undefined)

export const MarqueeProvider = Ctx

export function useMarqueeContext(): MarqueeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('[xh] Marquee 部件必须用在 XhMarqueeRoot 内')
  return ctx
}
