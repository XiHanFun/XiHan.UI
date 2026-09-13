/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 gradient text 相关实现。

import type { ComponentMeta } from '../spec/types'

export const gradientTextMeta: ComponentMeta = {
  component: 'gradient-text',
  // 解剖只有根：被上色的是作者自己的文字，不属于本组件的角色节点
  requiredParts: ['root'],
}
