/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid 相关实现。

import type { ComponentMeta } from '../spec/types'

export const gridMeta: ComponentMeta = {
  component: 'grid',
  // 只有根是必备的：一格都不摆也是一个合法的容器
  requiredParts: ['root'],
}
