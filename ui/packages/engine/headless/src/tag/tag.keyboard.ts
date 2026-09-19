/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tag 相关实现。

import type { KeyboardTable } from '../spec/types'

// 标签本身不接收焦点；键盘可达的只有那颗关闭钮，激活由平台负责，
// 所以出处指向 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const tagKeyboard: KeyboardTable = {
  component: 'tag',
  source: APG,
  rows: [
    {
      id: 'tag.kbd.close',
      keys: ['Enter', 'Space'],
      when: 'focus 在 close-trigger 上，且 closable 且未禁用、非只读',
      does: '收起标签并通知 open=false；关闭按钮是原生 button，这两个键由平台转换为 click',
    },
    {
      id: 'tag.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in close-trigger, closable 且未禁用、非只读',
      does: '按住期间关闭按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中转入禁用 / 只读、收回关闭按钮或标签收起也撤下。root 由把标签当条目用的宿主（tag-group）接同一条通道',
    },
  ],
}
