/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 editable 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 无就地编辑模式，光标/选区/撤销均由浏览器原生处理，
// 组件只定义编辑态收尾的三个键，故出处指向 HTML 规范的文本输入状态。
const SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

export const editableKeyboard: KeyboardTable = {
  component: 'editable',
  source: SPEC,
  rows: [
    {
      id: 'editable.kbd.submit',
      keys: ['Enter'],
      when: 'focus in input, submitMode 为 enter 或 both',
      does: '提交当下的值并回到预览态；其余模式不接管该键，交回给浏览器与外层表单',
    },
    {
      id: 'editable.kbd.cancel',
      keys: ['Escape'],
      when: 'focus in input',
      does: '撤销回上一次提交的值并回到预览态',
    },
    {
      id: 'editable.kbd.leave',
      keys: ['Tab', 'Shift+Tab'],
      when: 'focus in input',
      does: '按 submitMode 收尾（blur/both 提交，enter/none 撤销）；不拦默认行为，焦点照常移出',
    },
    {
      id: 'editable.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held on edit-trigger（预览态，not disabled/readOnly）或 submit-trigger / cancel-trigger（编辑态）',
      does: '按住期间这颗钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，进出编辑态后按钮藏起一并撤下',
    },
  ],
}
