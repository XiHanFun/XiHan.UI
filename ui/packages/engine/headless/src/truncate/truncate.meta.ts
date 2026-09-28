/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 缺了就既没有夹字的盒子也没有可量的对象；trigger 只在开了 expandable 时才用得上。
export const truncateMeta: ComponentMeta = {
  component: 'truncate',
  requiredParts: ['root'],
}
