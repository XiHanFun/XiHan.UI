/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 text field 模块的公共接口。

export { textFieldAnatomy } from './text-field.anatomy'
export { autoSizeTextarea } from './text-field.autosize'
export { connectTextField } from './text-field.connect'
export { textFieldKeyboard } from './text-field.keyboard'
export { clampToMaxLength, isAtLimit, textFieldMachine } from './text-field.machine'
export { textFieldMeta } from './text-field.meta'
export type { TextFieldApi, TextFieldAutoSize, TextFieldInputHost, TextFieldInputProps, TextFieldSchema, TextFieldTranslations, TextFieldType, TextFieldValueChangeDetails } from './text-field.types'
