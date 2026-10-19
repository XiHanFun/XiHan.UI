/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction'

// 缺省的焦点粒度是一整行：表体里只有锚点行占 Tab 位，方向键在可见数据行上走，左右方向键展开 / 收起当前行。
// navigation 为 cell 时照 treegrid 多一层格子：锚点可以是一格，格子之间与格内编辑的按键见 cell 那几行。
// 表头里的排序把手与全选把手不在 roving 行组内，各自占一个 Tab 位。
export const tableKeyboard: KeyboardTable = {
  component: 'table',
  source: APG,
  rows: [
    { id: 'table.kbd.press', keys: ['Enter', 'Space'], when: 'held on 可按部件, 未加载且部件自身未禁用', does: '按住期间行、全选 / 行选 / 展开 / 列显隐把手、排序把手或取下一页按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，取数在途由机器撤下。选中、排序与展开语义照旧由这一次按键承担' },
    { id: 'table.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside the table body', does: '表体只占一个 Tab 位：焦点进入锚点行，无锚点时先落 body 再由它转投；再按一次 Tab 整体离开表体' },
    { id: 'table.kbd.next', keys: ['ArrowDown'], when: 'focus in table body', does: '焦点移到下一个可见数据行（禁用行跳过；详情行不是落点；loop 默认关，末行不回绕）' },
    { id: 'table.kbd.prev', keys: ['ArrowUp'], when: 'focus in table body', does: '焦点移到上一个可见数据行（禁用行跳过；loop 默认关，首行不回绕）' },
    { id: 'table.kbd.first', keys: ['Home'], when: 'focus in table body', does: '焦点移到首个可见数据行' },
    { id: 'table.kbd.last', keys: ['End'], when: 'focus in table body', does: '焦点移到末个可见数据行' },
    { id: 'table.kbd.action', keys: ['Enter'], when: 'focus on row, 该行未禁用', does: '触发行主操作（onAction，column 为 null），用来下钻或联动；焦点停在行内控件上时 Enter 归那个控件，选中仍归 Space' },
    { id: 'table.kbd.select', keys: ['Space'], when: 'focus on row, selectionMode 非 none 且该行未禁用', does: '切换焦点行的选中（单选替换、复选增删）；选不动时不吞这个键，页面照常滚动' },
    { id: 'table.kbd.expand', keys: ['ArrowRight'], when: 'focus on 可展开且收起的行（dir=rtl 时改由 ArrowLeft 承担）', does: '就地展开当前行，焦点不动；不可展开、已展开或禁用的行上什么都不做且不吞键' },
    { id: 'table.kbd.collapse', keys: ['ArrowLeft'], when: 'focus on 可展开且已展开的行（dir=rtl 时改由 ArrowRight 承担）', does: '就地收起当前行，焦点不动；其余情形什么都不做且不吞键' },
    { id: 'table.kbd.sort', keys: ['Enter', 'Space'], when: 'focus on sort-trigger, 该列 sortable', does: '排序方向按 升序 → 降序 → 不排序 循环；按住 Shift 是追加到排序链而不是替换整条链' },
    { id: 'table.kbd.select-all', keys: ['Enter', 'Space'], when: 'focus on select-all-trigger, selectionMode=multiple', does: '当前可选行全选中就整段清空，否则整段选上；三态由 aria-checked 报出（半选为 mixed）' },
    { id: 'table.kbd.column-visibility', keys: ['Enter', 'Space'], when: 'focus on column-visibility-trigger', does: '藏起 / 放出这一列；设置区不是 roving 集合，一列一个 Tab 位，Tab 一路走下去即可逐列开关。只剩最后一列显示着时它转 aria-disabled，按了不动' },
    { id: 'table.kbd.select-all-body', keys: ['Ctrl+A', 'Cmd+A'], when: 'focus in table body, selectionMode=multiple', does: '与全选把手同义：当前可选行全选中就整段清空，否则整段选上（禁用行不算进基数）。单选与不可选的表格不吞这个键，交还浏览器的整页全选；按住不放的连发只算一次' },
    { id: 'table.kbd.column-resize', keys: ['ArrowLeft', 'ArrowRight'], when: 'focus in column-resize-trigger，该列 resizable', does: '把这一列按 8px 收窄 / 加宽；往行尾侧推是加宽，rtl 下左右两键对调，语义恒是「加宽 / 收窄」' },
    { id: 'table.kbd.column-resize-large', keys: ['Shift+ArrowLeft', 'Shift+ArrowRight'], when: 'focus in column-resize-trigger，该列 resizable', does: '按 40px 收窄 / 加宽，方向规则同上' },
    { id: 'table.kbd.column-move', keys: ['ArrowLeft', 'ArrowRight'], when: 'focus in column-drag-trigger，该列在可拖的那一段里', does: '把这一列往前 / 往后挪一位，按一下就是一次完整提交；往行首侧挪是往前，rtl 下左右两键对调，语义恒是「往前 / 往后」；已在段首 / 段末就不动，也不回绕' },
    { id: 'table.kbd.column-move-edge', keys: ['Home', 'End'], when: 'focus in column-drag-trigger，该列在可拖的那一段里', does: '把这一列挪到可拖那一段的段首 / 段末；rtl 下两键对调，语义恒是「段首 / 段末」；已经在那儿就不动' },
    { id: 'table.kbd.cell-enter', keys: ['ArrowRight'], when: 'navigation=cell，focus on 已展开或不可展开的行（dir=rtl 时改由 ArrowLeft 承担）', does: '焦点进到这一行的首格；收起的可展开行上仍是展开' },
    { id: 'table.kbd.cell-parent', keys: ['ArrowLeft'], when: 'navigation=cell，focus on 收起或不可展开、且有父行的行（dir=rtl 时改由 ArrowRight 承担）', does: '焦点回到父行；已展开的行上仍是收起，根层的行上什么都不做且不吞键' },
    { id: 'table.kbd.cell-move', keys: ['ArrowRight', 'ArrowLeft'], when: 'navigation=cell，focus on 表体格子', does: '焦点在这一行的格子之间走一格；已在末格就停住，首格再往回走一格回到行；被合并掉的格子跳过。rtl 下两键对调，语义恒是「下一格 / 上一格」' },
    { id: 'table.kbd.cell-column', keys: ['ArrowDown', 'ArrowUp'], when: 'navigation=cell，focus on 表体格子', does: '焦点移到下一个 / 上一个可见数据行的同一列（禁用行跳过，loop 默认关）；那一行的这一列被合并掉时落到行上' },
    { id: 'table.kbd.cell-row-edge', keys: ['Home', 'End'], when: 'navigation=cell，focus on 表体格子', does: '焦点移到本行的首格 / 末格' },
    { id: 'table.kbd.cell-column-edge', keys: ['Ctrl+Home', 'Ctrl+End'], when: 'navigation=cell，focus in table body', does: '焦点在格子上时移到本列的首行 / 末行，在行上时移到首行 / 末行' },
    { id: 'table.kbd.cell-edit', keys: ['Enter', 'F2'], when: 'navigation=cell，focus on 表体格子', does: '放开这一格的控件、焦点交给其中第一个（格内编辑），编辑时方向键等按键都归控件；格内没有控件时 Enter 触发行主操作（onAction，column 是这一格的列 id），F2 无事可做' },
    { id: 'table.kbd.cell-edit-tab', keys: ['Tab', 'Shift+Tab'], when: 'navigation=cell，focus in 表体格子里的控件', does: '只在这一格的控件之间走，到头回绕，不离开这一格；格里只有一个控件时停在它上面；控件自己用掉了 Tab 时不管' },
    { id: 'table.kbd.cell-edit-exit', keys: ['Escape', 'F2'], when: 'navigation=cell，focus in 表体格子里的控件', does: '退出格内编辑，焦点回到这一格；控件自己用掉了 Escape（比如收起它的下拉）时不退出' },
    { id: 'table.kbd.row-move', keys: ['Alt+ArrowUp', 'Alt+ArrowDown'], when: 'focus in table body，rowReorderable 且行拖拽没有被阻断的原因', does: '把焦点行往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已在首行 / 末行就不动，也不回绕；焦点锚点跟着搬走的那一行，连按几下能一路挪到位。裸方向键仍是导航、Space 仍是选中、左右键仍是展开收起' },
    { id: 'table.kbd.row-indent', keys: ['Alt+ArrowLeft', 'Alt+ArrowRight'], when: 'focus in table body，rows 里有行声明了 parentId，rowReorderable 且行拖拽没有被阻断的原因', does: '把焦点行改一层缩进：往里是认上一个兄弟当爹，往外是变成父行的下一个兄弟；按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻，rtl 下两键对调，语义恒是「往里 / 往外」；没有上一个兄弟就缩不进去、已在根层就退不出来，两种情形都不动。rows 里一行都不带 parentId 时这两个键不归表格管，放行给页面' },
  ],
}
