/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { KeyboardTable } from '../spec/types'

// 单行文本框的键盘交互归浏览器管，组件只额外接回车收下、Escape 撤草稿 / 清空。
// APG 里没有对应条目，故出处指向 HTML 规范的文本输入状态。
const SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

export const colorFieldKeyboard: KeyboardTable = {
  component: 'color-field',
  source: SPEC,
  rows: [
    {
      id: 'color-field.kbd.commit',
      keys: ['Enter'],
      when: 'focus in input, 框里有还没收下的草稿',
      does: '收下草稿：解析得了就按 format 重写成值，解析不了保留草稿并标成无效；没在编辑时不接管，回车照常提交表单',
    },
    {
      id: 'color-field.kbd.cancel',
      keys: ['Escape'],
      when: 'focus in input, 框里有还没收下的草稿',
      does: '放弃草稿，框里回到当前值的规范文本',
    },
    {
      id: 'color-field.kbd.clear',
      keys: ['Escape'],
      when: 'focus in input, 没有草稿, clearable 且值非空, not disabled/readOnly',
      does: '清空值；条件不满足即不接管该键，交回给外层与浏览器',
    },
  ],
}
