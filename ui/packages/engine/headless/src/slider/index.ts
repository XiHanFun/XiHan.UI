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
export type {
  SliderApi,
  SliderMark,
  SliderMarkMeta,
  SliderMarkProps,
  SliderPoint,
  SliderSchema,
  SliderThumbState,
  SliderValueChangeDetails,
  SliderValueChangeEndDetails,
  SliderValueTextDetails,
} from './slider.types'
