/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 icon 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

// 不可聚焦、不接任何键。
export const iconKeyboard: KeyboardTable = {
  component: 'icon',
  source: APG,
  rows: [],
}
