/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const emptyStateAnatomy = createAnatomy('empty-state', [
  'root',
  // 插画槽，与字形槽二选一：插画按自己的尺寸档量，不挤进字形那把尺
  'media',
  'indicator',
  'title',
  'description',
  'action',
])
