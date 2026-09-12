import type { KeyboardTable } from '../spec/types'

const ARIA_DIALOG = 'https://www.w3.org/TR/wai-aria-1.2/#dialog'

export const popconfirmKeyboard: KeyboardTable = {
  component: 'popconfirm',
  source: ARIA_DIALOG,
  rows: [
    { id: 'popconfirm.kbd.toggle-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '切换开合，展开时把焦点移入 content' },
    { id: 'popconfirm.kbd.confirm', keys: ['Enter', 'Space'], when: 'focus in confirm-trigger', does: '发确认意图；同步成功或 thenable 兑现后收起' },
    { id: 'popconfirm.kbd.cancel', keys: ['Enter', 'Space'], when: 'focus in cancel-trigger', does: '终止组件等待，发取消意图并收起浮层' },
    { id: 'popconfirm.kbd.escape', keys: ['Escape'], when: 'open and not pending', does: '收起浮层并把焦点还给 trigger；不发确认也不发取消', restoresFocus: true },
  ],
}
