/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FieldsetContext } from './use-fieldset'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FieldsetContext> = Symbol.for('xh-fieldset')

export function provideFieldset(ctx: FieldsetContext): void {
  provide(KEY, ctx)
}

export function useFieldsetContext(): FieldsetContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Fieldset 部件必须用在 XhFieldsetRoot 内')
  return ctx
}
