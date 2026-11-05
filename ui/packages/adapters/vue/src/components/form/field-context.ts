/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表单字段组的上下文：字段容器把字段名与值端口交给后代，录入控件（经 runtime/use-machine）据此读写表单的值。
// 不依赖表单上下文，runtime 引它不会绕回 use-form。

import type { FormFieldModel, FormPath } from '@xihan-ui/headless'
import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/** 字段容器把字段名交给后代：Field 据此从表单上下文自取校验态。 */
export interface FormFieldHandle {
  name: () => FormPath
  /** 这个字段的值端口：组里没给值的录入控件经它按字段名读写表单的值。 */
  model: FormFieldModel
}

const FIELD_KEY: InjectionKey<FormFieldHandle | null> = Symbol.for('xh-form-field')

export function provideFormField(handle: FormFieldHandle): void {
  provide(FIELD_KEY, handle)
}

/** 在这棵子树里断开表单字段组：后代控件不再按外层字段名取校验态与必填。 */
export function clearFormField(): void {
  provide(FIELD_KEY, null)
}

export function useOptionalFormField(): FormFieldHandle | null {
  return inject(FIELD_KEY, null)
}
