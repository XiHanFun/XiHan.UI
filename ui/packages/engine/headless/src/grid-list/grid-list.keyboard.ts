/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid list 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteractionforlayoutgrids'

export const gridListKeyboard: KeyboardTable = {
  component: 'grid-list',
  source: APG,
  rows: [
    { id: 'grid-list.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside grid list', does: '进入当前锚点行；行内按钮保持原生 Tab 次序' },
    { id: 'grid-list.kbd.next', keys: ['ArrowDown'], when: 'focus on row', does: '焦点移到下一行；到末尾时按 loop 决定是否回绕' },
    { id: 'grid-list.kbd.prev', keys: ['ArrowUp'], when: 'focus on row', does: '焦点移到上一行；到开头时按 loop 决定是否回绕' },
    { id: 'grid-list.kbd.first', keys: ['Home'], when: 'focus on row', does: '焦点移到第一行' },
    { id: 'grid-list.kbd.last', keys: ['End'], when: 'focus on row', does: '焦点移到最后一行' },
    { id: 'grid-list.kbd.select', keys: ['Space'], when: 'focus on selectable row', does: '单选时选中这一行，多选时切换这一行；不触发行内按钮' },
    { id: 'grid-list.kbd.extend', keys: ['Shift+ArrowDown', 'Shift+ArrowUp', 'Shift+Home', 'Shift+End'], when: 'focus on row, selectionMode=multiple', does: '焦点移动，并把锚点到新焦点行那一段并进扩选开始前的选中；往回扩即收回，禁用行不被收进去' },
    { id: 'grid-list.kbd.extend-select', keys: ['Shift+Space'], when: 'focus on row, selectionMode=multiple', does: '把锚点到焦点行那一段并进扩选开始前的选中；没有锚点时切换这一行并记为锚点' },
    { id: 'grid-list.kbd.action', keys: ['Enter'], when: 'focus on row', does: '触发行主操作；未提供主操作且允许选择时改为选中这一行' },
    { id: 'grid-list.kbd.select-all', keys: ['Ctrl+A', 'Cmd+A'], when: 'focus on multiple grid list', does: '选中全部可选行；已经全选时取消全部可选行' },
    { id: 'grid-list.kbd.typeahead', keys: ['单个可打印字符'], when: 'focus on row, typeahead 未关闭', does: '按行标题连打检索，只移动焦点' },
    { id: 'grid-list.kbd.inline-action', keys: ['Enter', 'Space'], when: 'focus on inline button', does: '交给原生按钮；不改变行选中状态，也不触发行主操作' },
  ],
}
