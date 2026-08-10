import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const buttonKeyboard: KeyboardTable = {
  component: 'button',
  source: APG,
  rows: [
    { id: 'button.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in root, interactive', does: '激活按钮（原生行为）' },
  ],
}
