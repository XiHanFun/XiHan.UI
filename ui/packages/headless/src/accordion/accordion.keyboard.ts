import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction'

export const accordionKeyboard: KeyboardTable = {
  component: 'accordion',
  source: APG,
  rows: [
    { id: 'accordion.kbd.toggle', keys: ['Space', 'Enter'], when: 'focus in trigger, not disabled', does: '展开/收起该条目的 content' },
    { id: 'accordion.kbd.next', keys: ['ArrowDown'], when: 'focus in trigger, orientation=vertical', does: '焦点移到下一个 trigger，末条不回绕' },
    { id: 'accordion.kbd.prev', keys: ['ArrowUp'], when: 'focus in trigger, orientation=vertical', does: '焦点移到上一个 trigger，首条不回绕' },
    { id: 'accordion.kbd.first', keys: ['Home'], when: 'focus in trigger', does: '焦点移到首个 trigger' },
    { id: 'accordion.kbd.last', keys: ['End'], when: 'focus in trigger', does: '焦点移到末个 trigger' },
    { id: 'accordion.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in trigger', does: '按文档序进出：每个 trigger 都是独立 Tab 停靠点，无 roving tabindex' },
  ],
}
