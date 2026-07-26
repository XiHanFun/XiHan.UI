import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction'

export const switchKeyboard: KeyboardTable = {
  component: 'switch',
  source: APG,
  rows: [
    { id: 'switch.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in root, not disabled', does: '切换 checked 状态' },
  ],
}
