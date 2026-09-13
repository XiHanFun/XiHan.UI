/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { SeparatorApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface SeparatorContext {
  api: ComputedRef<SeparatorApi>
}

const KEY: InjectionKey<SeparatorContext> = Symbol.for('xh-separator')

export function provideSeparator(ctx: SeparatorContext): void {
  provide(KEY, ctx)
}

export function useSeparatorContext(): SeparatorContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Separator 部件必须用在 XhSeparatorRoot 内')
  return ctx
}
