import type { KeyboardTable } from '../spec/types'

// 标签本身不接收焦点；键盘可达的只有那颗关闭钮，激活由平台负责，
// 所以出处指向 APG 的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const tagKeyboard: KeyboardTable = {
  component: 'tag',
  source: APG,
  rows: [
    {
      id: 'tag.kbd.close',
      keys: ['Enter', 'Space'],
      when: 'focus 在 close-trigger 上，且 closable 且未禁用',
      does: '收起标签并通知 open=false；关闭钮是原生 button，这两个键由平台翻成 click',
    },
  ],
}
