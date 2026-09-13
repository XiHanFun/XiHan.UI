/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SignaturePadContext } from './use-signature-pad'
import { createContext, useContext } from 'react'

const Ctx = createContext<SignaturePadContext | undefined>(undefined)

export const SignaturePadProvider = Ctx

export function useSignaturePadContext(): SignaturePadContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhSignaturePad 的部件要放在 XhSignaturePadRoot 里')
  return ctx
}
