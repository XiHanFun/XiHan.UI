/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ToolCallContext } from './use-tool-call'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ToolCallContext> = Symbol.for('xh-tool-call')

export function provideToolCall(ctx: ToolCallContext): void {
  provide(KEY, ctx)
}

export function useToolCallContext(): ToolCallContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ToolCall 部件必须用在 XhToolCallRoot 内')
  return ctx
}
