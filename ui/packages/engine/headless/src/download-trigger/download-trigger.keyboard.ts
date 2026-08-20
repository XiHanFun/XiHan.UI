import type { KeyboardTable } from '../spec/types'

// 触发器就是一个原生按钮，键盘约定照按钮模式：两个激活键由平台翻成 click，组件不自己接键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const downloadTriggerKeyboard: KeyboardTable = {
  component: 'download-trigger',
  source: APG,
  rows: [
    { id: 'download-trigger.kbd.activate', keys: ['Enter', 'Space'], when: 'focus in root, 未禁用', does: '发起一次下载；取数在途时这两个键同样不会重复发起' },
  ],
}
