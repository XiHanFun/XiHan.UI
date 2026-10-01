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
  resolveFloatButtonOffset,
} from './float-button.connect'
export { FLOAT_BUTTON_DEFAULT_SNAP } from './float-button.geometry'
export { floatButtonKeyboard } from './float-button.keyboard'
export { floatButtonMachine } from './float-button.machine'
export { floatButtonMeta } from './float-button.meta'
export type {
  FloatButtonApi,
  FloatButtonAppearance,
  FloatButtonDisclosureProps,
  FloatButtonDrag,
  FloatButtonEdge,
  FloatButtonEdgePosition,
  FloatButtonExpandTrigger,
  FloatButtonNotifiers,
  FloatButtonPlacement,
  FloatButtonPoint,
  FloatButtonPointPosition,
  FloatButtonPosition,
  FloatButtonPositionChangeDetails,
  FloatButtonPositionProps,
  FloatButtonProps,
  FloatButtonRefs,
  FloatButtonSchema,
  FloatButtonSettle,
  FloatButtonSnap,
  FloatButtonTranslations,
} from './float-button.types'
