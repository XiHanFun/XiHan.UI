/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { WatermarkApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface WatermarkContext {
  api: ComputedRef<WatermarkApi>
}

const KEY: InjectionKey<WatermarkContext> = Symbol.for('xh-watermark')

export function provideWatermark(ctx: WatermarkContext): void {
  provide(KEY, ctx)
}

export function useWatermarkContext(): WatermarkContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Watermark 部件必须用在 XhWatermarkRoot 内')
  return ctx
}
