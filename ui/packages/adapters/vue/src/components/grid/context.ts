/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { GridApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface GridContext {
  api: ComputedRef<GridApi>
}

const KEY: InjectionKey<GridContext> = Symbol.for('xh-grid')

export function provideGrid(ctx: GridContext): void {
  provide(KEY, ctx)
}

export function useGridContext(): GridContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Grid 部件必须用在 XhGridRoot 内')
  return ctx
}
