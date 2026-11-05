/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表单字段组的上下文：字段容器把字段名与值端口交给后代，录入控件（经 runtime/use-machine）据此读写表单的值。
// 不依赖表单上下文，runtime 引它不会绕回 use-form。

import type { FormFieldModel, FormPath } from '@xihan-ui/headless'
import { createContext, useContext } from 'react'

/** 字段容器把字段名交给后代：Field 据此从表单上下文自取校验态。 */
export interface FormFieldHandle {
  name: FormPath
  /** 这个字段的值端口：组里没给值的录入控件经它按字段名读写表单的值。 */
  model: FormFieldModel
}

const FieldCtx = createContext<FormFieldHandle | undefined>(undefined)

export const FormFieldProvider = FieldCtx

export function useOptionalFormField(): FormFieldHandle | undefined {
  return useContext(FieldCtx)
}
