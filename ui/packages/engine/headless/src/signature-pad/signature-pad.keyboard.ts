import type { KeyboardTable } from '../spec/types'

// 画布本身不接键盘：签名是一段指针轨迹，用键盘复现不出来。
// 组件里唯一的键盘落点是清空按钮，它是原生 button，键盘约定取自 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const signaturePadKeyboard: KeyboardTable = {
  component: 'signature-pad',
  source: APG,
  rows: [
    {
      id: 'signature-pad.kbd.clear',
      keys: ['Enter', 'Space'],
      when: 'focus on clear-trigger, 未禁用且非只读',
      does: '清空整块画布；按钮是原生 button，这两个键由平台翻成 click',
    },
  ],
}
