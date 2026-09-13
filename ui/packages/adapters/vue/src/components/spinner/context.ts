/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { SpinnerContext } from './use-spinner'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SpinnerContext> = Symbol.for('xh-spinner')

export function provideSpinner(ctx: SpinnerContext): void {
  provide(KEY, ctx)
}

export function useSpinnerContext(): SpinnerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Spinner 部件必须用在 XhSpinner 内')
  return ctx
}
