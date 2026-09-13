/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tour 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const tourAnatomy = createAnatomy('tour', [
  'root',
  'backdrop',
  'spotlight',
  'positioner',
  'content',
  'title',
  'description',
  'progress-text',
  'progress-indicator',
  'progress-dot',
  'prev-trigger',
  'next-trigger',
  'skip-trigger',
  'close-trigger',
  'arrow',
])
