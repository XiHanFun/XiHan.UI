/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { WatermarkApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface WatermarkContext {
  api: WatermarkApi
}

const Ctx = createContext<WatermarkContext | undefined>(undefined)

export const WatermarkProvider = Ctx

export function useWatermarkContext(): WatermarkContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhWatermark 的部件要放在 XhWatermarkRoot 里')
  return ctx
}
