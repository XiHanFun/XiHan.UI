/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 没有条件树编辑模式：根与每个组、每个条件都是 group，键盘行为由里面的控件各自提供，另加两组行级快捷键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

export const filterBuilderKeyboard: KeyboardTable = {
  component: 'filter-builder',
  source: APG,
  rows: [
    { id: 'filter-builder.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in root', does: '顺着条件行里的字段、运算符、取值来源、值、忽略大小写与删除钮走，组尾是「加条件」与「加条件组」' },
    { id: 'filter-builder.kbd.move', keys: ['Alt+Shift+ArrowUp', 'Alt+Shift+ArrowDown'], when: 'focus in condition, not disabled, not readOnly', does: '在同一组里把这一行往前 / 往后挪一位，焦点跟着这一行；已在首位 / 末位就不动；Alt+↑ / ↓ 留给组合框的展开与收起' },
    { id: 'filter-builder.kbd.remove', keys: ['Ctrl+Delete'], when: 'focus in condition, not disabled, not readOnly', does: '删除这一行，焦点落到同组的下一行，没有时落到上一行，再没有落到「加条件」' },
    { id: 'filter-builder.kbd.controls', keys: ['ArrowUp', 'ArrowDown', 'Enter', 'Space'], when: 'focus in a control', does: '交给里面的下拉、分段切换、输入框、日期框、标签输入与开关各自的键盘行为' },
  ],
}
