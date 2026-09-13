/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { ComponentMeta } from '../spec/types'

// 只有一个部件，缺了它就既没有夹字的盒子也没有可量的对象。
export const truncateMeta: ComponentMeta = {
  component: 'truncate',
  requiredParts: ['root'],
}
