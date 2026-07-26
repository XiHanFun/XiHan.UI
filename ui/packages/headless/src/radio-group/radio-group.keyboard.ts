import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

export const radioGroupKeyboard: KeyboardTable = {
  component: 'radio-group',
  source: APG,
  rows: [
    { id: 'radio-group.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the group', does: '整组只占一个 Tab 位：焦点进入锚点条目，无锚点时进入容器' },
    { id: 'radio-group.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: 'focus in group, group not disabled', does: '焦点移到下一个可停留条目并选中，末项回绕到首项' },
    { id: 'radio-group.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: 'focus in group, group not disabled', does: '焦点移到上一个可停留条目并选中，首项回绕到末项' },
    { id: 'radio-group.kbd.select', keys: ['Space'], when: 'focus on item, item not disabled', does: '选中当前条目' },
  ],
}
