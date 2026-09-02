import type { KeyboardTable } from '../spec/types'

// 抽屉的键盘契约与模态对话框逐条相同：它就是贴边渲染的对话框，
// side 只改滑入方向，不改任何一条按键语义。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const drawerKeyboard: KeyboardTable = {
  component: 'drawer',
  source: APG,
  rows: [
    { id: 'drawer.kbd.open-on-trigger', keys: ['Enter', 'Space'], when: 'focus in trigger', does: '打开抽屉并把焦点移入 content' },
    { id: 'drawer.kbd.escape', keys: ['Escape'], when: 'open', does: '关闭并把焦点还给 trigger', restoresFocus: true },
    { id: 'drawer.kbd.tab', keys: ['Tab'], when: 'open 且 modal', does: '在 content 内向后循环焦点' },
    { id: 'drawer.kbd.shift-tab', keys: ['Shift+Tab'], when: 'open 且 modal', does: '在 content 内向前循环焦点' },
  ],
}
