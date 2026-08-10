import type { KeyboardTable } from '../spec/types'

// 通知本身不抢焦点、也不是层，因此没有 Escape 这类全局键；
// 键盘可达的只有它内部那两个原生按钮，激活由平台负责。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

export const toastKeyboard: KeyboardTable = {
  component: 'toast',
  source: APG,
  rows: [
    {
      id: 'toast.kbd.close',
      keys: ['Enter', 'Space'],
      when: 'focus 在 close-trigger 上且 closable',
      does: '立即进入 dismissing，走完 removeDelay 后转 unmounted',
    },
    {
      id: 'toast.kbd.action',
      keys: ['Enter', 'Space'],
      when: 'focus 在 action-trigger 上',
      does: '触发 onAction 并进入 dismissing',
    },
  ],
}
