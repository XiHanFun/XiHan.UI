/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const dialogKeyboard: KeyboardTable = {
  component: 'dialog',
  source: APG,
  rows: [
    { id: 'dialog.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开对话框并把焦点移入 content' },
    { id: 'dialog.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger', restoresFocus: true },
    { id: 'dialog.kbd.tab', keys: ['Tab'], when: 'open', does: '在 content 内向后循环焦点' },
    { id: 'dialog.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open', does: '在 content 内向前循环焦点' },
    { id: 'dialog.kbd.press', keys: ['Enter', 'Space'], when: 'held in trigger / close-trigger', does: '按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或面板收起撤下' },
  ],
}
