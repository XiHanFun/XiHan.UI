/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { KeyboardTable } from '../spec/types'

// 文字盒子恒不接收焦点、不接管按键；展开交互在旁边那颗原生按钮上，按钮那套走。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

export const truncateKeyboard: KeyboardTable = {
  component: 'truncate',
  source: APG,
  rows: [
    {
      id: 'truncate.kbd.toggle',
      keys: ['Enter', 'Space'],
      when: 'expandable，焦点在 trigger 上',
      does: '铺开全文 / 收回夹住的那一版；原生按钮自带的激活行为',
    },
    {
      id: 'truncate.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'expandable 且真被裁或已铺开',
      does: '停到展开按钮上；没东西可展开时按钮收起，不在 Tab 序列里；文字盒子恒不停',
    },
  ],
}
