/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 presence 相关实现。

import type { KeyboardTable } from '../spec/types'

// 只管进出场，不可聚焦、不接任何按键；里面内容的键盘行为归内容自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const presenceKeyboard: KeyboardTable = {
  component: 'presence',
  source: APG,
  rows: [],
}
