/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ListApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface ListContext {
  api: ComputedRef<ListApi>
}

const KEY: InjectionKey<ListContext> = Symbol.for('xh-list')

export function provideList(ctx: ListContext): void {
  provide(KEY, ctx)
}

export function useListContext(): ListContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] List 部件必须用在 XhListRoot 内')
  return ctx
}
