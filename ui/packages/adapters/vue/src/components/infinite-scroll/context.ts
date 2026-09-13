/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { InfiniteScrollContext } from './use-infinite-scroll'
import { inject, provide } from 'vue'

const KEY: InjectionKey<InfiniteScrollContext> = Symbol.for('xh-infinite-scroll')

export function provideInfiniteScroll(ctx: InfiniteScrollContext): void {
  provide(KEY, ctx)
}

export function useInfiniteScrollContext(): InfiniteScrollContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] InfiniteScroll 部件必须用在 XhInfiniteScrollRoot 内')
  return ctx
}
