/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 focus trap 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

// 停用时焦点还给激活前的持有者，那不是按键触发的，不进这张表；Escape 不归它，越过它交给下面的层。
export const focusTrapKeyboard: KeyboardTable = {
  component: 'focus-trap',
  source: APG,
  rows: [
    { id: 'focus-trap.kbd.tab', keys: ['Tab'], when: 'active', does: '移到下一个可聚焦元素；在最后一个上时回到第一个，loop 为 false 时停在最后一个' },
    { id: 'focus-trap.kbd.shift-tab', keys: ['Shift+Tab'], when: 'active', does: '移到上一个可聚焦元素；在第一个上时回到最后一个，loop 为 false 时停在第一个' },
  ],
}
