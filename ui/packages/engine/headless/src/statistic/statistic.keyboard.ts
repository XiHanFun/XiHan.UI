/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 statistic 相关实现。

import type { KeyboardTable } from '../spec/types'

// 纯展示，自身不可聚焦、不接管按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const statisticKeyboard: KeyboardTable = {
  component: 'statistic',
  source: APG,
  rows: [],
}
