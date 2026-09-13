/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const colorPickerAnatomy = createAnatomy('color-picker', [
  'root',
  'label',
  'control',
  'trigger',
  'value-text',
  'swatch',
  'positioner',
  'content',
  'saturation-area',
  'area-thumb',
  'channel-slider',
  'channel-slider-track',
  'channel-slider-thumb',
  'channel-input',
  'eye-dropper-trigger',
  'swatch-group',
  'swatch-item',
  'hidden-input',
])
