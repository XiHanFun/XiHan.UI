/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 avatar 相关实现。

import type { ComponentMeta } from '../spec/types'

// image 可省，只给回退内容也成立
export const avatarMeta: ComponentMeta = {
  component: 'avatar',
  requiredParts: ['fallback'],
}
