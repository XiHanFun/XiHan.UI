/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 visually hidden 相关实现。

import type { KeyboardTable } from '../spec/types'

// 自身不可聚焦、不接按键；focusable 时显出的是作者放进来的链接或按钮，键盘行为归它们。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const visuallyHiddenKeyboard: KeyboardTable = {
  component: 'visually-hidden',
  source: APG,
  rows: [],
}
