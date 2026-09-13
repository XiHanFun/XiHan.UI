/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 statistic 相关实现。

import type { ComponentMeta } from '../spec/types'

export const statisticMeta: ComponentMeta = {
  component: 'statistic',
  // 只有根是必备的：标签、前后缀都可以不给，只摆一个数值也是一块合法的统计
  requiredParts: ['root'],
}
