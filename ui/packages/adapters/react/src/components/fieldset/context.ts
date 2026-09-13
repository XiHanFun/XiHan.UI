/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FieldsetContext } from './use-fieldset'
import { createContext, useContext } from 'react'

const Ctx = createContext<FieldsetContext | undefined>(undefined)

export const FieldsetProvider = Ctx

export function useFieldsetContext(): FieldsetContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhFieldset 的部件要放在 XhFieldsetRoot 里')
  return ctx
}
