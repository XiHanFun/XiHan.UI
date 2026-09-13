/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 page header 相关实现。

import type { KeyboardTable } from '../spec/types'

// 页头是容器，不接收焦点；返回位是作者自己的按钮，它怎么响应键盘归它自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const pageHeaderKeyboard: KeyboardTable = {
  component: 'page-header',
  source: APG,
  rows: [],
}
