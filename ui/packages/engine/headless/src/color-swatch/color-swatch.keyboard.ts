/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

// 色块是纯展示，不接键盘。
export const colorSwatchKeyboard: KeyboardTable = {
  component: 'color-swatch',
  source: APG,
  rows: [],
}
