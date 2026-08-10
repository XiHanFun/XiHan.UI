import type { KeyboardTable } from '../spec/types'

// 骨架自身不接管按键；能按的只有折叠把手，它是原生按钮，Enter/Space 由平台翻成激活。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction'

export const layoutKeyboard: KeyboardTable = {
  component: 'layout',
  source: APG,
  rows: [
    {
      id: 'layout.kbd.toggle-sider',
      keys: ['Space', 'Enter'],
      when: 'focus in sider-trigger',
      does: '折叠/展开 sider',
    },
  ],
}
