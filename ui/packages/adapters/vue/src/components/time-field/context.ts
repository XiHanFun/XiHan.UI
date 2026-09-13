/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { TimeFieldContext } from './use-time-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<TimeFieldContext> = Symbol.for('xh-time-field')

export function provideTimeField(ctx: TimeFieldContext): void {
  provide(KEY, ctx)
}

export function useTimeFieldContext(): TimeFieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TimeField 部件必须用在 XhTimeFieldRoot 内')
  return ctx
}
