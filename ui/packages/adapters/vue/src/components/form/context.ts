/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { InjectionKey } from 'vue'
import type { FormContext } from './use-form'
import { inject, provide } from 'vue'

const KEY: InjectionKey<FormContext> = Symbol.for('xh-form')

export function provideForm(ctx: FormContext): void {
  provide(KEY, ctx)
}

export function useFormContext(): FormContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Form 部件必须用在 XhFormRoot 内')
  return ctx
}

/** 表单外也能使用的部件（如 Field）从这里获取：不在表单内时为 null。 */
export function useOptionalFormContext(): FormContext | null {
  return inject(KEY, null)
}

// 字段组上下文住在 field-context：runtime/use-machine 要读它，而本文件经 FormContext 的类型连着 use-form，
// 从这里引会绕成 use-machine → context → use-form → use-machine 的环
export type { FormFieldHandle } from './field-context'
export { clearFormField, provideFormField, useOptionalFormField } from './field-context'
