/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 accordion 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const accordionAnatomy = createAnatomy('accordion', [
  'root',
  'item',
  // 条目之间的那条细线；作者不渲染它时条目直接相邻
  'item-separator',
  'header',
  'trigger',
  'content',
  'indicator',
])
