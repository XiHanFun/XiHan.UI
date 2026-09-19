/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction'

export const checkboxKeyboard: KeyboardTable = {
  component: 'checkbox',
  source: APG,
  rows: [
    { id: 'checkbox.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in root, not disabled', does: '切换 checked 状态' },
    { id: 'checkbox.kbd.press', keys: ['Space', 'Enter'], when: 'held in root, not disabled, not readOnly', does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中转入禁用或只读也撤下。与勾选态互相独立' },
  ],
}
