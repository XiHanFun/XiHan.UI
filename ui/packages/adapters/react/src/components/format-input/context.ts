/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FormatInputContext } from './use-format-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<FormatInputContext | undefined>(undefined)

export const FormatInputProvider = Ctx

export function useFormatInputContext(): FormatInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFormatInput 的部件要放在 XhFormatInputRoot 里')
  return ctx
}
