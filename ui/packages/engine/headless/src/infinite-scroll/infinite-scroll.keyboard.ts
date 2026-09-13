/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 infinite scroll 相关实现。

import type { KeyboardTable } from '../spec/types'

// 触发的判据是"哨兵进没进可视区"，滚动本身走浏览器原生通路；组件不接收焦点，也不接管任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const infiniteScrollKeyboard: KeyboardTable = {
  component: 'infinite-scroll',
  source: APG,
  rows: [],
}
