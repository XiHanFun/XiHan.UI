/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ExpressionInputContext } from './use-expression-input'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ExpressionInputContext> = Symbol.for('xh-expression-input')

export function provideExpressionInput(ctx: ExpressionInputContext): void {
  provide(KEY, ctx)
}

export function useExpressionInputContext(): ExpressionInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ExpressionInput 部件必须用在 XhExpressionInputRoot 内')
  return ctx
}
