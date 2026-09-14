/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const colorFieldAnatomy = createAnatomy('color-field', [
  'root',
  'label',
  'control',
  'swatch',
  'input',
  'clear-trigger',
  'hidden-input',
])
