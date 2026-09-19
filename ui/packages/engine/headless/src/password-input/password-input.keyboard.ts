/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 password input 相关实现。

import type { KeyboardTable } from '../spec/types'

// 输入框里的光标、选区与撤销全归浏览器；组件自己只多出一个明暗切换钮。
// 那个钮是原生 button，键盘约定取自 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const passwordInputKeyboard: KeyboardTable = {
  component: 'password-input',
  source: APG,
  rows: [
    {
      id: 'password-input.kbd.toggle',
      keys: ['Enter', 'Space'],
      when: 'focus on visibility-trigger, 控件未禁用',
      does: '切换明暗；切换按钮是原生 button，这两个键由平台转换为 click。焦点留在按钮上，输入框中的光标与选中范围原样恢复',
    },
    {
      id: 'password-input.kbd.caps-lock',
      keys: ['CapsLock'],
      when: 'focus in input',
      does: '每次按键都重读一次大写锁定状态：开着就亮起提示，焦点离开输入框即熄灭',
    },
    {
      id: 'password-input.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held on visibility-trigger, 控件未禁用',
      does: '按住期间切换按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中明暗翻面不影响按压面。只读不拦明暗，按压面也照常给',
    },
  ],
}
