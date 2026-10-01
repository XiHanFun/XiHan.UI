/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ColorPickerContext } from './use-color-picker'
import { createContext, useContext } from 'react'

const Ctx = createContext<ColorPickerContext | undefined>(undefined)
const TagCtx = createContext<string | undefined>(undefined)

export const ColorPickerProvider = Ctx
export const ColorPickerTagProvider = TagCtx

export function useColorPickerContext(): ColorPickerContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhColorPicker 的部件要放在 XhColorPickerRoot 里')
  return ctx
}

export function useColorPickerTagContext(): string {
  const value = useContext(TagCtx)
  if (value === undefined)
    throw new Error('XhColorPickerItemDeleteTrigger 要放在 XhColorPickerTag 里')
  return value
}
