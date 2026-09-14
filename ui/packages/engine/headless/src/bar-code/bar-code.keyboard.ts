/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 bar code 相关实现。

import type { KeyboardTable } from '../spec/types'

// 条形码是一张图，不可聚焦、不接任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

export const barCodeKeyboard: KeyboardTable = {
  component: 'bar-code',
  source: APG,
  rows: [],
}
