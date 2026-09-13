/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 slider 相关实现。

import type { ComponentMeta } from '../spec/types'

export const sliderMeta: ComponentMeta = {
  component: 'slider',
  requiredParts: ['root', 'control', 'track', 'thumb'],
}
