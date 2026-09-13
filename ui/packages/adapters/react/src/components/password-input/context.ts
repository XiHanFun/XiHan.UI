/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { PasswordInputContext } from './use-password-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<PasswordInputContext | undefined>(undefined)

export const PasswordInputProvider = Ctx

export function usePasswordInputContext(): PasswordInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPasswordInput 的部件要放在 XhPasswordInputRoot 里')
  return ctx
}
