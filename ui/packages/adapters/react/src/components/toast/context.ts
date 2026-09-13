/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ToastContext } from './use-toast'
import { createContext, useContext } from 'react'

const Ctx = createContext<ToastContext | undefined>(undefined)

export const ToastProvider = Ctx

export function useToastContext(): ToastContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhToast 的部件要放在 XhToastRoot 里')
  return ctx
}
