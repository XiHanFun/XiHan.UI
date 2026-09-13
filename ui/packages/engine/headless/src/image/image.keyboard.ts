/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

// 纯展示，不可聚焦，无键盘交互。
export const imageKeyboard: KeyboardTable = {
  component: 'image',
  source: APG,
  rows: [],
}
