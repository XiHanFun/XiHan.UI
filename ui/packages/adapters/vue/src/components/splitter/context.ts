/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { SplitterContext } from './use-splitter'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SplitterContext> = Symbol.for('xh-splitter')

export function provideSplitter(ctx: SplitterContext): void {
  provide(KEY, ctx)
}

export function useSplitterContext(): SplitterContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Splitter 部件必须用在 XhSplitterRoot 内')
  return ctx
}
