import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction'

export const checkboxKeyboard: KeyboardTable = {
  component: 'checkbox',
  source: APG,
  rows: [
    { id: 'checkbox.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in root, not disabled', does: '切换 checked 状态' },
  ],
}
