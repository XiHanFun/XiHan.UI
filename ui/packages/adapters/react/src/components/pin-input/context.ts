/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { PinInputContext } from './use-pin-input'
import { createContext, useContext } from 'react'

const Ctx = createContext<PinInputContext | undefined>(undefined)

export const PinInputProvider = Ctx

export function usePinInputContext(): PinInputContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPinInput 的部件要放在 XhPinInputRoot 里')
  return ctx
}
