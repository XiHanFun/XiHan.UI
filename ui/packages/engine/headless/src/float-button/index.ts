/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 float button 模块的公共接口。

export { floatButtonAnatomy } from './float-button.anatomy'
export {
  connectFloatButton,
  FLOAT_BUTTON_DEFAULT_OFFSET,
  FLOAT_BUTTON_DEFAULT_PLACEMENT,
  FLOAT_BUTTON_DEFAULT_SHAPE,
  resolveFloatButtonOffset,
} from './float-button.connect'
export { floatButtonKeyboard } from './float-button.keyboard'
export { floatButtonMachine } from './float-button.machine'
export { floatButtonMeta } from './float-button.meta'
export type {
  FloatButtonApi,
  FloatButtonAppearance,
  FloatButtonDisclosureProps,
  FloatButtonExpandTrigger,
  FloatButtonNotifiers,
  FloatButtonPlacement,
  FloatButtonProps,
  FloatButtonRefs,
  FloatButtonSchema,
  FloatButtonShape,
  FloatButtonTranslations,
} from './float-button.types'
