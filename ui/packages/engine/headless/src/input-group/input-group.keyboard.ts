/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 input group 相关实现。

import type { KeyboardTable } from '../spec/types'

// 输入组是容器，不接收焦点；组内每一段仍是各自独立的控件，Tab 逐个停留、按键归控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const inputGroupKeyboard: KeyboardTable = {
  component: 'input-group',
  source: APG,
  rows: [],
}
