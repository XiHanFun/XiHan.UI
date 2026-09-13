/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 text field 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const textFieldAnatomy = createAnatomy('text-field', [
  'root',
  'label',
  'control',
  'prefix',
  'input',
  'suffix',
  'clear-trigger',
  'count',
])
