/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 pin input 模块的公共接口。

export { pinInputAnatomy } from './pin-input.anatomy'
export { connectPinInput } from './pin-input.connect'
export { pinInputKeyboard } from './pin-input.keyboard'
export {
  firstEmptyPinIndex,
  isPinComplete,
  padPinValue,
  PIN_INPUT_LENGTH,
  pinFocusTarget,
  pinInputMachine,
  pinLength,
  samePinValue,
  sanitizePin,
} from './pin-input.machine'
export { pinInputMeta } from './pin-input.meta'
export type {
  PinInputApi,
  PinInputInputProps,
  PinInputSchema,
  PinInputTranslations,
  PinInputType,
  PinInputValueChangeDetails,
} from './pin-input.types'
