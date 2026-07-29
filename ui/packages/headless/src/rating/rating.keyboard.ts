import type { KeyboardTable } from '../spec/types'

// 键盘契约对齐 radio 模式；allowHalf 打开时一档是半颗星。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

export const ratingKeyboard: KeyboardTable = {
  component: 'rating',
  source: APG,
  rows: [
    { id: 'rating.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the control', does: '整条评分带只占一个 Tab 位：焦点进入锚点那颗星，无锚点时进入容器并由它转投首颗' },
    { id: 'rating.kbd.increment', keys: ['ArrowRight', 'ArrowUp'], when: 'focus in control, not disabled/readOnly', does: '加一档（allowHalf 时半颗），到顶停在 count；dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'rating.kbd.decrement', keys: ['ArrowLeft', 'ArrowDown'], when: 'focus in control, not disabled/readOnly', does: '减一档，到底停在最小档，不会退回"还没评"；dir=rtl 时改由 ArrowRight 承担' },
    { id: 'rating.kbd.min', keys: ['Home'], when: 'focus in control, not disabled/readOnly', does: '取最小档（allowHalf 时是半颗，否则一颗）' },
    { id: 'rating.kbd.max', keys: ['End'], when: 'focus in control, not disabled/readOnly', does: '取满分（count）' },
  ],
}
