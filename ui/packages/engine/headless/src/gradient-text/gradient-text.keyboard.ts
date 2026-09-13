/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 gradient text 相关实现。

import type { KeyboardTable } from '../spec/types'

// 只给一段文字换个上色方式，不可聚焦、不接管按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const gradientTextKeyboard: KeyboardTable = {
  component: 'gradient-text',
  source: APG,
  rows: [],
}
