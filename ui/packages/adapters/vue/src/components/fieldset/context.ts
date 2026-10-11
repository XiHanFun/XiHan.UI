/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { ComputedRef, InjectionKey } from 'vue'
import type { FieldsetContext } from './use-fieldset'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FieldsetContext> = Symbol.for('xh-fieldset')
const OUTER_DISABLED_KEY: InjectionKey<ComputedRef<boolean>> = Symbol.for('xh-fieldset-outer-disabled')

/** 字段集外面那一层的作用域禁用：legend 里的控件不吃本组的禁用，恢复成它。 */
export function provideFieldsetOuterDisabled(outer: ComputedRef<boolean>): void {
  provide(OUTER_DISABLED_KEY, outer)
}

export function useFieldsetOuterDisabled(): ComputedRef<boolean> | undefined {
  return inject(OUTER_DISABLED_KEY, undefined)
}

export function provideFieldset(ctx: FieldsetContext): void {
  provide(KEY, ctx)
}

export function useFieldsetContext(): FieldsetContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Fieldset 部件必须用在 XhFieldsetRoot 内')
  return ctx
}
