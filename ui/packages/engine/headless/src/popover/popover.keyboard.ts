import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const popoverKeyboard: KeyboardTable = {
  component: 'popover',
  source: APG,
  rows: [
    { id: 'popover.kbd.toggle-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '切换开合，展开时把焦点移入 content' },
    { id: 'popover.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger', restoresFocus: true },
    { id: 'popover.kbd.tab', keys: ['Tab'], when: 'open 且 modal', does: '在 content 内向后循环焦点' },
    { id: 'popover.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open 且 modal', does: '在 content 内向前循环焦点' },
  ],
}
