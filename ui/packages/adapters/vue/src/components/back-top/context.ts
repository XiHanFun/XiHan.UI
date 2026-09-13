/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { BackTopContext } from './use-back-top'
import { inject, provide } from 'vue'

const KEY: InjectionKey<BackTopContext> = Symbol.for('xh-back-top')

export function provideBackTop(ctx: BackTopContext): void {
  provide(KEY, ctx)
}

export function useBackTopContext(): BackTopContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] BackTop 部件必须用在 XhBackTopRoot 内')
  return ctx
}
