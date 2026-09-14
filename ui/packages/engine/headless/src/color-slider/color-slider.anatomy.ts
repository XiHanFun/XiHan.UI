/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color slider 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const colorSliderAnatomy = createAnatomy('color-slider', [
  'root',
  'label',
  'control',
  'track',
  'thumb',
  'value-text',
  'hidden-input',
])
