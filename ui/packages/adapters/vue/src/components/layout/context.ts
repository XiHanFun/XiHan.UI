/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { LayoutContext } from './use-layout'
import { inject, provide } from 'vue'

const KEY: InjectionKey<LayoutContext> = Symbol.for('xh-layout')

export function provideLayout(ctx: LayoutContext): void {
  provide(KEY, ctx)
}

export function useLayoutContext(): LayoutContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Layout 部件必须用在 XhLayoutRoot 内')
  return ctx
}
