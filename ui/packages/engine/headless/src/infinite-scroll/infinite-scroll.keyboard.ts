/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 infinite scroll 相关实现。

import type { KeyboardTable } from '../spec/types'

// 触发的判据是"哨兵进没进可视区"，滚动本身走浏览器原生通路；组件不接收焦点，也不接管任何按键。
// 取下一页的按钮是原生 button，激活归浏览器；这里只登它的按压回执。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const infiniteScrollKeyboard: KeyboardTable = {
  component: 'infinite-scroll',
  source: APG,
  rows: [
    { id: 'infinite-scroll.kbd.press', keys: ['Enter', 'Space'], when: 'held in load-more-trigger, 未关闭且未在取数', does: '按住期间 load-more-trigger 投影 data-pressed，与指针 :active 同一副按压面（row 档只换面不缩放）；抬起、失焦或进入取数 / 关闭撤下' },
  ],
}
