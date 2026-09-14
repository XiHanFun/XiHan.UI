/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { MatrixCodeApi } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

export interface MatrixCodeContext {
  api: MatrixCodeApi
}

const Ctx = createContext<MatrixCodeContext | undefined>(undefined)

export const MatrixCodeProvider = Ctx

export function useMatrixCodeContext(): MatrixCodeContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhMatrixCode 的部件要放在 XhMatrixCode 里')
  return ctx
}
