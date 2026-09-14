/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { ColorFieldContext } from './use-color-field'
import { inject, provide } from 'vue'

const KEY: InjectionKey<ColorFieldContext> = Symbol.for('xh-color-field')

export function provideColorField(ctx: ColorFieldContext): void {
  provide(KEY, ctx)
}

export function useColorFieldContext(): ColorFieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] ColorField 部件必须用在 XhColorFieldRoot 内')
  return ctx
}
