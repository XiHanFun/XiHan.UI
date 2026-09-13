/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TextFieldContext } from './use-text-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<TextFieldContext | undefined>(undefined)

export const TextFieldProvider = Ctx

export function useTextFieldContext(): TextFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTextField 的部件要放在 XhTextFieldRoot 里')
  return ctx
}
