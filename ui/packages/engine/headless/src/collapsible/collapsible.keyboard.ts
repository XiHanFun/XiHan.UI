/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 collapsible 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction'

export const collapsibleKeyboard: KeyboardTable = {
  component: 'collapsible',
  source: APG,
  rows: [
    { id: 'collapsible.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in trigger, not disabled', does: '展开/收起 content' },
  ],
}
