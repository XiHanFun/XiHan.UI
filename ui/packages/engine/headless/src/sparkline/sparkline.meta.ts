/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { ComponentMeta } from '../spec/types'

// 根是尺寸观测的宿主，也是图形的画布；其余部件都按数据生成，作者不写。
export const sparklineMeta: ComponentMeta = {
  component: 'sparkline',
  requiredParts: ['root'],
}
