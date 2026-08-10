import type { KeyboardTable } from '../spec/types'

// trigger 是原生 <button>：Enter / Space 的激活与 Tab 停靠都由平台提供，组件不接管任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const backTopKeyboard: KeyboardTable = {
  component: 'back-top',
  source: APG,
  rows: [
    {
      id: 'back-top.kbd.activate',
      keys: ['Enter', 'Space'],
      when: 'focus in trigger',
      does: '滚回顶部；按 behavior 决定是一步到位还是平滑滚过去',
    },
    {
      id: 'back-top.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'trigger 露面时',
      does: '走到按钮上；收起时整个 root 带 hidden，按钮不在 Tab 序列里',
    },
  ],
}
