/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 resizable 相关实现。

import type { ComponentMeta } from '../spec/types'

export const resizableMeta: ComponentMeta = {
  component: 'resizable',
  // handle 不列：只读不可调的形态是正当的，作者可以一个把手都不放
  requiredParts: ['root'],
}
