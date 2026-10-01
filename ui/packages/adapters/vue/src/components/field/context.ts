/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FieldContext } from './use-field'
import { inject, provide } from 'vue'
import { clearFormField } from '../form/context'

const KEY: InjectionKey<FieldContext | null> = Symbol.for('xh-field')

export function provideField(ctx: FieldContext): void {
  provide(KEY, ctx)
}

/**
 * 在这棵子树里断开外层字段：后代控件不再被外层字段命名、描述，不再继承它的禁用、只读、必填与无效，
 * 也不再拿到同一个控件 id；表单字段组随之断开。XhFieldBoundary 与浮层的 Portal 都在这里断开。
 */
export function clearFieldContext(): void {
  provide(KEY, null)
  clearFormField()
}

/** 字段外调用时返回 null，供薄封装在字段内外都能安全使用。 */
export function useOptionalFieldContext(): FieldContext | null {
  return inject(KEY, null)
}

export function useFieldContext(): FieldContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Field 部件必须用在 XhFieldRoot 内')
  return ctx
}
