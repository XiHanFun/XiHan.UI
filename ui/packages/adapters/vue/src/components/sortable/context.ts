/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { SortableContext } from './use-sortable'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SortableContext> = Symbol.for('xh-sortable')

export function provideSortable(ctx: SortableContext): void {
  provide(KEY, ctx)
}

export function useSortableContext(): SortableContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Sortable 部件必须用在 XhSortableRoot 内')
  return ctx
}
