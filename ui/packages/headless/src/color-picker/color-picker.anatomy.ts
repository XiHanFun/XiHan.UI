import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const colorPickerAnatomy = createAnatomy('color-picker', [
  'root',
  'label',
  'trigger',
  'value-text',
  'swatch',
  'positioner',
  'content',
  'area',
  'area-thumb',
  'channel-slider',
  'channel-slider-track',
  'channel-slider-thumb',
  'channel-input',
  'eye-dropper-trigger',
  'swatch-group',
  'swatch-item',
])
