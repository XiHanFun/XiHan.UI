/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { NumberFieldContext } from './use-number-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<NumberFieldContext | undefined>(undefined)

export const NumberFieldProvider = Ctx

export function useNumberFieldContext(): NumberFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhNumberField 的部件要放在 XhNumberFieldRoot 里')
  return ctx
}
