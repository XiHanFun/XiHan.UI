import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

export const radioGroupKeyboard: KeyboardTable = {
  component: 'radio-group',
  source: APG,
  rows: [
    { id: 'radio-group.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the group', does: '整组只占一个 Tab 位：焦点进入锚点条目（即选中项）；落到容器上时由容器转投锚点条目，锚点缺席或被禁用才落首个可停留项' },
    { id: 'radio-group.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: 'focus in group, group not disabled', does: '焦点移到下一个可停留条目并选中，末项回绕到首项；dir=rtl 时改由 ArrowLeft 承担' },
    { id: 'radio-group.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: 'focus in group, group not disabled', does: '焦点移到上一个可停留条目并选中，首项回绕到末项；dir=rtl 时改由 ArrowRight 承担' },
    { id: 'radio-group.kbd.select', keys: ['Space'], when: 'focus on item, item not disabled', does: '选中当前条目' },
  ],
}
