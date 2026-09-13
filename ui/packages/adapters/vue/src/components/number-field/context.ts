/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { NumberFieldContext } from './use-number-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<NumberFieldContext> = Symbol.for('xh-number-field')

export function provideNumberField(ctx: NumberFieldContext): void {
  provide(KEY, ctx)
}

export function useNumberFieldContext(): NumberFieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] NumberField 部件必须用在 XhNumberFieldRoot 内')
  return ctx
}
