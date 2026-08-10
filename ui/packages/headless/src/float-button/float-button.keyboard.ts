import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction'

export const floatButtonKeyboard: KeyboardTable = {
  component: 'float-button',
  source: APG,
  rows: [
    {
      id: 'float-button.kbd.toggle',
      keys: ['Enter', 'Space'],
      when: 'focus in trigger, not disabled',
      does: '展开 / 收起 list；悬停展开时这条路照样在，触摸与键盘都靠它',
    },
    {
      id: 'float-button.kbd.escape',
      keys: ['Escape'],
      when: 'open，焦点在整组之内',
      does: '收起 list；悬停展开时指针一走就收，键盘上就只剩这一条路',
    },
    {
      id: 'float-button.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'open',
      does: '走进展开的那一组；收起时 list 带 hidden，里面的按钮一并退出 Tab 序列',
    },
  ],
}
