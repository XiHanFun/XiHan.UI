/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 rating 相关实现。

import type { ComponentMeta } from '../spec/types'

// label 与 hidden-input 可选，control 与 item 必需。
export const ratingMeta: ComponentMeta = {
  component: 'rating',
  requiredParts: ['root', 'control', 'item'],
}
