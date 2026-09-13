/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

// 纯展示，自身不可聚焦、不接管按键；操作槽里的按钮由作者自己提供键盘语义。
export const emptyStateKeyboard: KeyboardTable = {
  component: 'empty-state',
  source: APG,
  rows: [],
}
