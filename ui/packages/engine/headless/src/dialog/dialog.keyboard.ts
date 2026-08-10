import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const dialogKeyboard: KeyboardTable = {
  component: 'dialog',
  source: APG,
  rows: [
    { id: 'dialog.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开对话框并把焦点移入 content' },
    { id: 'dialog.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger' },
    { id: 'dialog.kbd.tab', keys: ['Tab'], when: 'open', does: '在 content 内向后循环焦点' },
    { id: 'dialog.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open', does: '在 content 内向前循环焦点' },
  ],
}
