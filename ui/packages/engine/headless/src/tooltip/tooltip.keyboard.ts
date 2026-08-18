import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/#keyboardinteraction'

export const tooltipKeyboard: KeyboardTable = {
  component: 'tooltip',
  source: APG,
  rows: [
    { id: 'tooltip.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'not disabled', does: '焦点进入 trigger 立即展开、离开立即收起，都不走延时' },
    { id: 'tooltip.kbd.escape', keys: ['Escape'], when: '展开中且本层在层栈栈顶，或 focus in trigger 且等待展开中', does: '立即收起，不等 closeDelay；下层浮层不受这一次按键影响' },
  ],
}
