/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const colorSwatchPickerAnatomy = createAnatomy('color-swatch-picker', [
  'root',
  'label',
  'item',
  'swatch',
  'indicator',
  'hidden-input',
])
