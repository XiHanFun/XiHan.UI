/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ExpressionInputItem } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ExpressionInputContext } from './use-expression-input'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ExpressionInputContext> = Symbol.for('xh-expression-input')
/** 当前补全条目，交给 prefix / text 等条目子部件；条目从候选里消失时为 undefined。 */
const ITEM_KEY: InjectionKey<ComputedRef<ExpressionInputItem | undefined>> = Symbol.for('xh-expression-input-item')

export function provideExpressionInput(ctx: ExpressionInputContext): void {
  provide(KEY, ctx)
}

export function useExpressionInputContext(): ExpressionInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ExpressionInput 部件必须用在 XhExpressionInputRoot 内')
  return ctx
}

export function provideExpressionInputItem(item: ComputedRef<ExpressionInputItem | undefined>): void {
  provide(ITEM_KEY, item)
}

export function useExpressionInputItemContext(): ComputedRef<ExpressionInputItem | undefined> {
  const item = inject(ITEM_KEY, null)
  if (!item)
    throw new Error('[xh] ExpressionInput 条目部件必须用在 XhExpressionInputItem 内')
  return item
}
