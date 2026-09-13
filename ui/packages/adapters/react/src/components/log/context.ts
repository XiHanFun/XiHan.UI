/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { LogContext } from './use-log'
import { createContext, useContext } from 'react'

const Ctx = createContext<LogContext | undefined>(undefined)

export const LogProvider = Ctx

export function useLogContext(): LogContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhLog 的部件要放在 XhLogRoot 里')
  return ctx
}
