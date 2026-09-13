/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 slider 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const sliderAnatomy = createAnatomy('slider', [
  'root',
  'label',
  'control',
  'track',
  'range',
  'thumb',
  'value-text',
  'tick-group',
  'tick',
  'tick-label',
  'hidden-input',
])
