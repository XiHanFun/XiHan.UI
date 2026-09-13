/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { CollapsibleContext } from './use-collapsible'
import { inject, provide } from 'vue'

const KEY: InjectionKey<CollapsibleContext> = Symbol.for('xh-collapsible')

export function provideCollapsible(ctx: CollapsibleContext): void {
  provide(KEY, ctx)
}

export function useCollapsibleContext(): CollapsibleContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Collapsible 部件必须用在 XhCollapsibleRoot 内')
  return ctx
}
