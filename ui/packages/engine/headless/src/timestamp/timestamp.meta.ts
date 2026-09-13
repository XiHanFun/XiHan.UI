/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { ComponentMeta } from '../spec/types'

export const timestampMeta: ComponentMeta = {
  component: 'timestamp',
  // 只有一个部件，缺了它 datetime 无处可落
  requiredParts: ['root'],
}
