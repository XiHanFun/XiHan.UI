/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
export const dialogAnatomy = createAnatomy('dialog', [
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'header',
  // 拖动把手：键盘挪动面板的入口，放在 header 里时铺满标题栏
  'drag-trigger',
  'indicator',
  'title',
  'description',
  'body',
  'footer',
  'close-trigger',
])
