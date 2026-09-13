/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 number field 模块的公共接口。

export { numberFieldAnatomy } from './number-field.anatomy'
export { connectNumberField } from './number-field.connect'
export { numberFieldKeyboard } from './number-field.keyboard'
export {
  NUMBER_FIELD_CHANGE_DELAY,
  NUMBER_FIELD_CHANGE_INTERVAL,
  NUMBER_FIELD_STEP,
  numberFieldMachine,
} from './number-field.machine'
export { numberFieldMeta } from './number-field.meta'
export type { NumberFieldApi, NumberFieldSchema, NumberFieldTranslations, NumberFieldValueChangeDetails } from './number-field.types'
