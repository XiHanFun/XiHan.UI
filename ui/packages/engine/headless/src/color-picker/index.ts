/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 color picker 模块的公共接口。

export { colorPickerAnatomy } from './color-picker.anatomy'
export {
  colorPickerApplyInput,
  colorPickerChannelRange,
  colorPickerChannelValue,
  colorPickerInputText,
  colorPickerToChannel,
  colorPickerToInputChannel,
  colorPickerWithArea,
  colorPickerWithChannel,
} from './color-picker.color'
export type { ColorPickerChannel, ColorPickerInputChannel } from './color-picker.color'
export { connectColorPicker } from './color-picker.connect'
export { colorPickerPercent, colorPickerPointRatio } from './color-picker.geometry'
export type { ColorPickerPoint, ColorPickerRatio, ColorPickerRect } from './color-picker.geometry'
export { colorPickerKeyboard } from './color-picker.keyboard'
export {
  COLOR_PICKER_DEFAULT_PLACEMENT,
  colorPickerChannelSliderProps,
  colorPickerHasEyeDropper,
  colorPickerMachine,
  colorPickerOpenEyeDropper,
} from './color-picker.machine'
export { colorPickerMeta } from './color-picker.meta'
export type {
  ColorPickerApi,
  ColorPickerChannelProps,
  ColorPickerChannelState,
  ColorPickerDraft,
  ColorPickerDragTarget,
  ColorPickerErrorDetails,
  ColorPickerErrors,
  ColorPickerEyeDropperErrorDetails,
  ColorPickerFormatErrorDetails,
  ColorPickerInputErrorDetails,
  ColorPickerInputProps,
  ColorPickerOpenChangeDetails,
  ColorPickerParseErrorDetails,
  ColorPickerRefs,
  ColorPickerSchema,
  ColorPickerServices,
  ColorPickerSwatchItemProps,
  ColorPickerTranslations,
  ColorPickerValueChangeDetails,
} from './color-picker.types'
