/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { KeyboardTable } from '../spec/types'

// 卡片是容器，不接收焦点；里面放什么控件、怎么响应键盘，归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const cardKeyboard: KeyboardTable = {
  component: 'card',
  source: APG,
  rows: [],
}
