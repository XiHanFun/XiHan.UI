/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TimeFieldContext } from './use-time-field'
import { createContext, useContext } from 'react'

const Ctx = createContext<TimeFieldContext | undefined>(undefined)

export const TimeFieldProvider = Ctx

export function useTimeFieldContext(): TimeFieldContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('TimeField 的部件要放在 XhTimeFieldRoot 里')
  return ctx
}
