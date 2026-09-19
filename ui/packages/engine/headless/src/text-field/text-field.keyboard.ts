/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 text field 相关实现。

import type { KeyboardTable } from '../spec/types'

// 单行文本框的键盘交互归浏览器管，组件只额外接一个 Escape 清空。
// APG 里没有对应条目，故出处指向 HTML 规范的文本输入状态。
const SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

export const textFieldKeyboard: KeyboardTable = {
  component: 'text-field',
  source: SPEC,
  rows: [
    {
      id: 'text-field.kbd.clear',
      keys: ['Escape'],
      when: 'focus in input, clearable 且值非空, not disabled/readOnly',
      does: '清空值；三个条件缺一即不接管该键，交回给外层与浏览器',
    },
    {
      id: 'text-field.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in clear-trigger, clearable 且值非空, not disabled/readOnly',
      does: '按住期间清空按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，值清空后按钮藏起一并撤下。清空按钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面',
    },
  ],
}
