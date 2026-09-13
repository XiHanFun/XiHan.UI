/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 clipboard 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const clipboardAnatomy = createAnatomy('clipboard', [
  'root',
  'label',
  'control',
  'input',
  'copy-trigger',
  'indicator',
  // 复制成功的播报区，视觉隐藏；不渲染它时读屏用户拿不到任何成功回执
  'status',
])
