import type { KeyboardTable } from '../spec/types'

// 骨架自身只接管一个键：侧栏按覆盖档盖在内容之上时的 Escape。
// 其余能按的只有折叠把手，它是原生按钮，Enter/Space 由平台翻成激活。
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
    {
      id: 'layout.kbd.dismiss-sider-sheet',
      keys: ['Escape'],
      when: 'sider 按覆盖档盖在内容之上',
      does: '收起 sider',
    },
  ],
}
