/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { KeyboardTable } from '../spec/types'

// 时间戳是一段文本，不可聚焦、不接任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const timestampKeyboard: KeyboardTable = {
  component: 'timestamp',
  source: APG,
  rows: [],
}
