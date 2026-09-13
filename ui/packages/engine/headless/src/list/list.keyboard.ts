/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 list 相关实现。

import type { KeyboardTable } from '../spec/types'

// 列表是容器，不接收焦点；条目里放了链接还是按钮，键盘响应归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const listKeyboard: KeyboardTable = {
  component: 'list',
  source: APG,
  rows: [],
}
