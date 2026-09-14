/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ColorSwatchPickerContext } from './use-color-swatch-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<ColorSwatchPickerContext | undefined>(undefined)

export const ColorSwatchPickerProvider = Ctx

export function useColorSwatchPickerContext(): ColorSwatchPickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhColorSwatchPicker 的部件要放在 XhColorSwatchPickerRoot 里')
  return ctx
}
