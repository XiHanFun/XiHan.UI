/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { BadgeApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface BadgeContext {
  api: ComputedRef<BadgeApi>
}

const KEY: InjectionKey<BadgeContext> = Symbol.for('xh-badge')

export function provideBadge(ctx: BadgeContext): void {
  provide(KEY, ctx)
}

export function useBadgeContext(): BadgeContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Badge 部件必须用在 XhBadgeRoot 内')
  return ctx
}
