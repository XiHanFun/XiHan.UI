/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 switch 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction'

export const switchKeyboard: KeyboardTable = {
  component: 'switch',
  source: APG,
  rows: [
    { id: 'switch.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in root, not disabled', does: '切换 checked 状态' },
    { id: 'switch.kbd.press', keys: ['Space', 'Enter'], when: 'held in root, not disabled, not loading, not readOnly', does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中转入禁用、提交中或只读也撤下。与开关态互相独立' },
  ],
}
