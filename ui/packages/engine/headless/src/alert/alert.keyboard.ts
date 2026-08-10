import type { KeyboardTable } from '../spec/types'

// 提示常驻页面流、不抢焦点，本身没有键盘交互；
// 键盘可达的只有作者写的那颗关闭按钮，激活由平台负责。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

export const alertKeyboard: KeyboardTable = {
  component: 'alert',
  source: APG,
  rows: [
    {
      id: 'alert.kbd.close',
      keys: ['Enter', 'Space'],
      when: 'focus 在 close-trigger 上且 closable',
      does: '收起提示并通知 open=false',
    },
  ],
}
