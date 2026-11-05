/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { FormContext } from './use-form'
import { createContext, useContext } from 'react'

const Ctx = createContext<FormContext | undefined>(undefined)

export const FormProvider = Ctx

export function useFormContext(): FormContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhForm 的部件要放在 XhFormRoot 里')
  return ctx
}

/** 表单外也能使用的部件（如 Field）从这里获取：不在表单内时为 undefined。 */
export function useOptionalFormContext(): FormContext | undefined {
  return useContext(Ctx)
}

// 字段组上下文住在 field-context：runtime/use-machine 要读它，而本文件经 FormContext 的类型连着 use-form，
// 从这里引会绕成 use-machine → context → use-form → use-machine 的环
export type { FormFieldHandle } from './field-context'
export { FormFieldProvider, useOptionalFormField } from './field-context'
