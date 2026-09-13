/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { TourContext } from './use-tour'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TourContext> = Symbol.for('xh-tour')

export function provideTour(ctx: TourContext): void {
  provide(KEY, ctx)
}

export function useTourContext(): TourContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Tour 部件必须用在 XhTourRoot 内')
  return ctx
}
