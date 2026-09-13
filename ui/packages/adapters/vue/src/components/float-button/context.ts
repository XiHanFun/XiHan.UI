/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FloatButtonContext } from './use-float-button'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FloatButtonContext> = Symbol.for('xh-float-button')

export function provideFloatButton(ctx: FloatButtonContext): void {
  provide(KEY, ctx)
}

export function useFloatButtonContext(): FloatButtonContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] FloatButton 部件必须用在 XhFloatButtonRoot 内')
  return ctx
}
