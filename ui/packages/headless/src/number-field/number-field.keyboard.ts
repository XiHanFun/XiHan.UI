import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'

export const numberFieldKeyboard: KeyboardTable = {
  component: 'number-field',
  source: APG,
  rows: [
    { id: 'number-field.kbd.increment', keys: ['ArrowUp'], when: 'focus in input, not disabled/readOnly', does: '按 step 递增，越界则停在 max' },
    { id: 'number-field.kbd.decrement', keys: ['ArrowDown'], when: 'focus in input, not disabled/readOnly', does: '按 step 递减，越界则停在 min' },
    { id: 'number-field.kbd.large-increment', keys: ['PageUp'], when: 'focus in input, not disabled/readOnly', does: '按 largeStep 递增（默认 10 倍 step）' },
    { id: 'number-field.kbd.large-decrement', keys: ['PageDown'], when: 'focus in input, not disabled/readOnly', does: '按 largeStep 递减' },
    { id: 'number-field.kbd.min', keys: ['Home'], when: 'focus in input, 指定了 min', does: '取 min；未指定 min 时不动' },
    { id: 'number-field.kbd.max', keys: ['End'], when: 'focus in input, 指定了 max', does: '取 max；未指定 max 时不动' },
  ],
}
