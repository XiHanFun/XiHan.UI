/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 没有格式编辑模式：根是 group，键盘行为全部由里面的控件各自提供，源头指向 group。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

export const formatInputKeyboard: KeyboardTable = {
  component: 'format-input',
  source: APG,
  rows: [
    { id: 'format-input.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in root', does: '按种类、参数行的次序经过里面的控件；样例与行内说明不可聚焦；种类一换，参数行随之换，焦点留在种类控件上' },
    { id: 'format-input.kbd.controls', keys: ['ArrowUp', 'ArrowDown', 'Enter', 'Space'], when: 'focus in a control', does: '交给里面的下拉、分段切换、数字框、开关与组合框各自的键盘行为' },
  ],
}
