/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ResizableContext } from './use-resizable'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ResizableContext> = Symbol.for('xh-resizable')

export function provideResizable(ctx: ResizableContext): void {
  provide(KEY, ctx)
}

export function useResizableContext(): ResizableContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Resizable 部件必须用在 XhResizableRoot 内')
  return ctx
}
