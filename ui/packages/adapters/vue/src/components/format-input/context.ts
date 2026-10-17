/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FormatInputContext } from './use-format-input'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FormatInputContext> = Symbol.for('xh-format-input')

export function provideFormatInput(ctx: FormatInputContext): void {
  provide(KEY, ctx)
}

export function useFormatInputContext(): FormatInputContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FormatInput 部件必须用在 XhFormatInputRoot 内')
  return ctx
}
