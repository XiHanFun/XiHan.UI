import type { KeyboardTable } from '../spec/types'

// 数字本身不可聚焦、不接任何按键；能按的只有起停按钮，它是原生 button，
// 键盘约定因此取自 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const timerKeyboard: KeyboardTable = {
  component: 'timer',
  source: APG,
  rows: [
    {
      id: 'timer.kbd.control',
      keys: ['Enter', 'Space'],
      when: 'focus on control',
      does: '按当前状态起停：没起步的开跑、在走的暂停、停在半路的接着走、走完的归零；control 是原生 button，这两个键由平台翻成 click',
    },
  ],
}
