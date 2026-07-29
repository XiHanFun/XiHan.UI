import type { KeyboardTable } from '../spec/types'

// 每格都是原生 text input，本表只定义格与格之间的移动。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#textbox'

export const pinInputKeyboard: KeyboardTable = {
  component: 'pin-input',
  source: APG,
  rows: [
    { id: 'pin-input.kbd.next', keys: ['ArrowRight'], when: 'focus in a box, not disabled', does: '焦点移到下一格；已在末格则不动，不回绕' },
    { id: 'pin-input.kbd.prev', keys: ['ArrowLeft'], when: 'focus in a box, not disabled', does: '焦点移到上一格；已在首格则不动，不回绕' },
    { id: 'pin-input.kbd.first', keys: ['Home'], when: 'focus in a box, not disabled', does: '焦点移到首格' },
    { id: 'pin-input.kbd.last', keys: ['End'], when: 'focus in a box, not disabled', does: '焦点移到末格' },
    { id: 'pin-input.kbd.backspace', keys: ['Backspace'], when: 'focus in a box, not disabled', does: '本格有值则清本格；本格为空则退回上一格并清掉上一格' },
    { id: 'pin-input.kbd.delete', keys: ['Delete'], when: 'focus in a box, not disabled', does: '清掉本格，焦点不动' },
  ],
}
