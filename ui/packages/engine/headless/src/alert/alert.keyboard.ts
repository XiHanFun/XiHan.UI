/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { KeyboardTable } from '../spec/types'

// 提示常驻页面流、不抢焦点，本身没有键盘交互；
// 键盘可达的只有作者写的那颗关闭按钮，激活由平台负责。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

export const alertKeyboard: KeyboardTable = {
  component: 'alert',
  source: APG,
  rows: [
    {
      id: 'alert.kbd.close',
      keys: ['Enter', 'Space'],
      when: 'focus 在 close-trigger 上且 closable',
      does: '收起提示并通知 open=false',
    },
    {
      id: 'alert.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held on close-trigger, closable',
      does: '按住期间关闭按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或提示收起撤下',
    },
  ],
}
