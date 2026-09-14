/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ColorSliderContext } from './use-color-slider'
import { createContext, useContext } from 'react'

const Ctx = createContext<ColorSliderContext | undefined>(undefined)

export const ColorSliderProvider = Ctx

export function useColorSliderContext(): ColorSliderContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhColorSlider 的部件要放在 XhColorSliderRoot 里')
  return ctx
}
