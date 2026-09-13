/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { CodeViewContext } from './use-code-view'
import { createContext, useContext } from 'react'

const Ctx = createContext<CodeViewContext | undefined>(undefined)

export const CodeViewProvider = Ctx

export function useCodeViewContext(): CodeViewContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhCodeView 的部件要放在 XhCodeViewRoot 里')
  return ctx
}
