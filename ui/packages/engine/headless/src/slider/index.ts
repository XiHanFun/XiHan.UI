/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 slider 模块的公共接口。

export { sliderAnatomy } from './slider.anatomy'
export { connectSlider } from './slider.connect'
export {
  closestThumb,
  normalizeMarkValues,
  percentToValue,
  pointToValue,
  rangeExtent,
  setThumbValue,
  snapToMarkValues,
  snapToStep,
  stepMarkValue,
  thumbBounds,
  valueToPercent,
} from './slider.geometry'
export type { AxisOptions, TrackRect } from './slider.geometry'
export { sliderKeyboard } from './slider.keyboard'
export { SLIDER_MAX, SLIDER_MIN, SLIDER_STEP, sliderMachine } from './slider.machine'
export { sliderMeta } from './slider.meta'
export type { SliderApi, SliderMark, SliderMarkMeta, SliderPoint, SliderSchema, SliderThumbState, SliderTickProps, SliderTranslations, SliderValueChangeDetails, SliderValueChangeEndDetails, SliderValueTextDetails } from './slider.types'
