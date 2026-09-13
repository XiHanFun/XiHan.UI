/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { PopconfirmContext } from './use-popconfirm'
import { createContext, useContext } from 'react'

const Ctx = createContext<PopconfirmContext | undefined>(undefined)

export const PopconfirmProvider = Ctx

export function usePopconfirmContext(): PopconfirmContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhPopconfirm 的部件要放在 XhPopconfirmRoot 里')
  return ctx
}
