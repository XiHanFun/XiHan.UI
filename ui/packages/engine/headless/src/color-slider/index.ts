/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 color slider 模块的公共接口。

export { colorSliderAnatomy } from './color-slider.anatomy'
export { connectColorSlider } from './color-slider.connect'
export { colorSliderKeyboard } from './color-slider.keyboard'
export { colorSliderAlpha, colorSliderMachine, colorSliderSliderProps, colorSliderTrackGradient, colorSliderTrackStops } from './color-slider.machine'
export { colorSliderMeta } from './color-slider.meta'
export type {
  ColorSliderApi,
  ColorSliderSchema,
  ColorSliderServices,
  ColorSliderTranslations,
  ColorSliderValueChangeDetails,
} from './color-slider.types'
