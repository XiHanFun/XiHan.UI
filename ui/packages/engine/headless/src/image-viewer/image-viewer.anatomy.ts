/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image viewer 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const imageViewerAnatomy = createAnatomy('image-viewer', [
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'viewport',
  'image',
  'toolbar',
  'zoom-in-trigger',
  'zoom-out-trigger',
  'rotate-left-trigger',
  'rotate-right-trigger',
  'flip-horizontal-trigger',
  'flip-vertical-trigger',
  'reset-trigger',
  'prev-trigger',
  'next-trigger',
  'counter',
  'close-trigger',
])
