/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { MarqueeApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface MarqueeContext {
  api: ComputedRef<MarqueeApi>
}

const KEY: InjectionKey<MarqueeContext> = Symbol.for('xh-marquee')

export function provideMarquee(ctx: MarqueeContext): void {
  provide(KEY, ctx)
}

export function useMarqueeContext(): MarqueeContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Marquee 部件必须用在 XhMarqueeRoot 内')
  return ctx
}
