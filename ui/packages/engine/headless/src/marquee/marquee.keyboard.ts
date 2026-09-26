/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { KeyboardTable } from '../spec/types'

// 跑马灯是容器，不接管按键；轨道里放的控件自己响应键盘。暂停开关是原生 <button>，
// Enter / Space 的激活与 Tab 停靠由平台提供。焦点落进窗口时轨道停住，那条是皮肤里的 :focus-within 规则，不经按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const marqueeKeyboard: KeyboardTable = {
  component: 'marquee',
  source: APG,
  rows: [
    {
      id: 'marquee.kbd.activate',
      keys: ['Enter', 'Space'],
      when: 'focus in autoplay-trigger',
      does: '在停住与继续之间切换；名字随之换成下一步的动作',
    },
    {
      id: 'marquee.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in autoplay-trigger',
      does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下',
    },
  ],
}
