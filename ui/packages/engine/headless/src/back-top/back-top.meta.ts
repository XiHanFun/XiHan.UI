/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 back top 相关实现。

import type { ComponentMeta } from '../spec/types'

// 两个都必备：root 是定位壳并承载显隐，trigger 是唯一可点、可聚焦的部件。
export const backTopMeta: ComponentMeta = {
  component: 'back-top',
  requiredParts: ['root', 'trigger'],
}
