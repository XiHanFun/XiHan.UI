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
  ],
}
