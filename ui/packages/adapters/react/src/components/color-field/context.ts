/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ColorFieldContext } from './use-color-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<ColorFieldContext | undefined>(undefined)

export const ColorFieldProvider = Ctx

export function useColorFieldContext(): ColorFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhColorField 的部件要放在 XhColorFieldRoot 里')
  return ctx
}
