/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 field array 模块的公共接口。

export { fieldArrayAnatomy, fieldArrayTriggerId } from './field-array.anatomy'
export { connectFieldArray } from './field-array.connect'
export { fieldArrayKeyboard } from './field-array.keyboard'
export { fieldArrayMachine } from './field-array.machine'
export { fieldArrayMeta } from './field-array.meta'
export type {
  FieldArrayApi,
  FieldArrayItem,
  FieldArrayItemProps,
  FieldArraySchema,
  FieldArrayTranslations,
  FieldArrayValueChangeDetails,
} from './field-array.types'
