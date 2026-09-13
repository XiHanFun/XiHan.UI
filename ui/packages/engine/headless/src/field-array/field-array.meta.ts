/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { ComponentMeta } from '../spec/types'

export const fieldArrayMeta: ComponentMeta = {
  component: 'field-array',
  // 只有根是必备的：一行都没有也是一份合法的空列表，行与把手按当前值铺
  requiredParts: ['root'],
}
