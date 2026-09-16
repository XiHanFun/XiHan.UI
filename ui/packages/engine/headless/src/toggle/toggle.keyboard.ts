/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const toggleKeyboard: KeyboardTable = {
  component: 'toggle',
  source: APG,
  rows: [
    { id: 'toggle.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in root, not disabled', does: '切换 pressed 状态' },
    { id: 'toggle.kbd.press', keys: ['Space', 'Enter'], when: 'held in root, not disabled', does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下' },
  ],
}
