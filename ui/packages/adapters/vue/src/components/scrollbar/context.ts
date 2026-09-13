/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ScrollbarContext } from './use-scrollbar'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ScrollbarContext> = Symbol.for('xh-scrollbar')

export function provideScrollbar(ctx: ScrollbarContext): void {
  provide(KEY, ctx)
}

export function useScrollbarContext(): ScrollbarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Scrollbar 部件必须用在 XhScrollbarRoot 内')
  return ctx
}
