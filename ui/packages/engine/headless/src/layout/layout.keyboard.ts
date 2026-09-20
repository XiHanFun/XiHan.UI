/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 layout 相关实现。

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
      id: 'layout.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in sider-trigger',
      does: '按住期间 sider-trigger 投影 data-pressed，与指针 :active 同一副按压面（text 档定尺按钮，按下缩放并换底）；抬起或失焦撤下。把手没有禁用态',
    },
    {
      id: 'layout.kbd.dismiss-sider-sheet',
      keys: ['Escape'],
      when: 'sider 按覆盖档盖在内容之上',
      does: '收起 sider',
    },
  ],
}
