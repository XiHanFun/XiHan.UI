/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 checkbox group 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction'

export const checkboxGroupKeyboard: KeyboardTable = {
  component: 'checkbox-group',
  source: APG,
  rows: [
    {
      id: 'checkbox-group.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'focus enters or leaves the group',
      does: '组内有几个条目就有几个 Tab 停靠点（禁用条目也留一个），容器自己不占位；单选组的"整组一个停靠点"在这里不成立',
    },
    {
      id: 'checkbox-group.kbd.toggle',
      keys: ['Space'],
      when: 'focus on item, group editable and item not disabled',
      does: '翻转该条目的选中态；改不动时放行按键给页面滚动',
    },
    {
      id: 'checkbox-group.kbd.toggle-all',
      keys: ['Space'],
      when: 'focus on select-all-trigger, group editable',
      does: '可用条目未全选则一并勾上，已全选则一并取消；禁用条目不受影响',
    },
    {
      id: 'checkbox-group.kbd.press',
      keys: ['Space'],
      when: 'held on item / select-all-trigger, group editable and item not disabled',
      does: '按住期间该行投影 data-pressed，与指针 :active 同一副按压面（行换面、方框随行换底，不缩放）；抬起或失焦撤下，按住途中整组转入禁用或只读也撤下。role=checkbox 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立',
    },
  ],
}
