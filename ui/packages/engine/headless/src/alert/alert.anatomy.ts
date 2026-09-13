/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const alertAnatomy = createAnatomy('alert', [
  'root',
  'indicator',
  // 必需的文本列：标题与说明摞成一列。
  'content',
  'title',
  'description',
  // 操作槽：圈出按钮区，按钮本身归作者。与 empty-state 的同名部件同一角色。
  'action',
  'close-trigger',
])
