/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 焦点自始至终在输入框上：方向键移的是 aria-activedescendant 指向的高亮。
// 收起态除 Ctrl+Space 外一条按键都不接管：这是一个正文输入框，回车留给表单或换行。
export const expressionInputKeyboard: KeyboardTable = {
  component: 'expression-input',
  source: APG,
  rows: [
    { id: 'expression-input.kbd.type', keys: ['名字字符'], when: '光标不在字符串或数字里', does: '按光标前的名字打开补全，有匹配才打开；名字前紧挨着点时只列宿主给的成员' },
    { id: 'expression-input.kbd.force', keys: ['Ctrl+Space'], when: '光标不在字符串或数字里', does: '主动打开补全，光标前没有名字也列出全部可用的变量与函数；没有匹配时显示空态' },
    { id: 'expression-input.kbd.next', keys: ['ArrowDown'], when: 'open', does: '高亮移到下一条（尽头按 loop 回绕），焦点不动' },
    { id: 'expression-input.kbd.prev', keys: ['ArrowUp'], when: 'open', does: '高亮移到上一条（尽头按 loop 回绕），焦点不动' },
    { id: 'expression-input.kbd.accept', keys: ['Enter', 'Tab'], when: 'open, 有高亮', does: '用高亮条目替换光标处的名字：函数插入 NAME() 且光标落在括号里，变量插入名字；补全收起，这次按键被吞掉' },
    { id: 'expression-input.kbd.enter-pass', keys: ['Enter'], when: 'closed', does: '不接管：单行时交给表单做隐式提交，多行时照常换行' },
    { id: 'expression-input.kbd.escape', keys: ['Escape'], when: 'open', does: '收起补全且值不变；接着输入名字字符会再打开' },
    { id: 'expression-input.kbd.caret', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '任意时候', does: '一律不接管：光标照常移动；打开着时按新位置重取名字，挪出名字即收起' },
  ],
}
