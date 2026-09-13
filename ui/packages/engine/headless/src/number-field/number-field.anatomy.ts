/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number field 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const numberFieldAnatomy = createAnatomy('number-field', [
  'root',
  'label',
  'control',
  'prefix',
  'input',
  'suffix',
  'increment-trigger',
  'decrement-trigger',
])
