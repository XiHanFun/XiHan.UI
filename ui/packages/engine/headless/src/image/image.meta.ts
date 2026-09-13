/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { ComponentMeta } from '../spec/types'

// fallback 可省。
export const imageMeta: ComponentMeta = {
  component: 'image',
  requiredParts: ['root', 'image'],
}
