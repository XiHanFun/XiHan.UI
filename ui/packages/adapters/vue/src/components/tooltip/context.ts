/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { TooltipContext } from './use-tooltip'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TooltipContext> = Symbol.for('xh-tooltip')

export function provideTooltip(ctx: TooltipContext): void {
  provide(KEY, ctx)
}

export function useTooltipContext(): TooltipContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tooltip 部件必须用在 XhTooltipRoot 内')
  return ctx
}
