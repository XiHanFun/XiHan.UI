/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timer 相关实现。

import type { KeyboardTable } from '../spec/types'

// 数字本身不可聚焦、不接任何按键；能按的只有起停按钮，它是原生 button，
// 键盘约定因此取自 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const timerKeyboard: KeyboardTable = {
  component: 'timer',
  source: APG,
  rows: [
    {
      id: 'timer.kbd.control',
      keys: ['Enter', 'Space'],
      when: 'focus on control',
      does: '按当前状态起停：没起步的开跑、在走的暂停、停在半路的接着走、走完的归零；control 是原生 button，这两个键由平台翻成 click',
    },
    {
      id: 'timer.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held on control',
      does: '按住期间 control 投影 data-pressed，与指针 :active 同一副按压面（text 档定尺按钮，按下缩放并换底）；抬起或失焦撤下。按钮没有禁用态，四段状态下都接，按住途中起停翻转按压面不丢',
    },
  ],
}
