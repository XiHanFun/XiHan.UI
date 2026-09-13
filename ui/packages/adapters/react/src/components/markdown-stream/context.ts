/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { MarkdownStreamContext } from './use-markdown-stream'
import { createContext, useContext } from 'react'

const Ctx = createContext<MarkdownStreamContext | undefined>(undefined)

export const MarkdownStreamProvider = Ctx

export function useMarkdownStreamContext(): MarkdownStreamContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhMarkdownStream 的部件要放在 XhMarkdownStreamRoot 里')
  return ctx
}
