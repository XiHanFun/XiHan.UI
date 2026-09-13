/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 anchor 相关实现。

import type { ComponentMeta } from '../spec/types'

// indicator 是纯装饰，可以不渲染
export const anchorMeta: ComponentMeta = {
  component: 'anchor',
  requiredParts: ['root', 'list', 'item', 'link'],
}
