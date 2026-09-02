import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/#keyboardinteraction'

export const popconfirmKeyboard: KeyboardTable = {
  component: 'popconfirm',
  source: APG,
  rows: [
    { id: 'popconfirm.kbd.toggle-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '切换开合，展开时把焦点移入 content' },
    { id: 'popconfirm.kbd.confirm', keys: ['Enter', 'Space'], when: 'focus in confirm-trigger', does: '发确认意图并收起浮层' },
    { id: 'popconfirm.kbd.cancel', keys: ['Enter', 'Space'], when: 'focus in cancel-trigger', does: '发取消意图并收起浮层' },
    { id: 'popconfirm.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点还给 trigger；不发确认也不发取消', restoresFocus: true },
  ],
}
