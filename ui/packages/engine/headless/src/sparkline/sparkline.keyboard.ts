/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { KeyboardTable } from '../spec/types'

// 迷你图是一幅随文的图像：不可聚焦、不接任何按键，要逐个读值就换直角坐标图。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

export const sparklineKeyboard: KeyboardTable = {
  component: 'sparkline',
  source: APG,
  rows: [],
}
