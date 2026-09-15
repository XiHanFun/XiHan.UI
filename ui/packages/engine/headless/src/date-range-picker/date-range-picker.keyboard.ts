/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label'

// 本表只列编排机接管的按键：浮层的开合、收起与焦点去处。
// 网格内的方向键、翻页键、确认键与撤起点见 calendar-range-picker 键盘表，段位上的按键见 date-field 键盘表。
export const dateRangePickerKeyboard: KeyboardTable = {
  component: 'date-range-picker',
  source: APG,
  rows: [
    { id: 'date-range-picker.kbd.open', keys: ['Enter', 'Space'], when: 'focus in trigger, closed', does: '展开日历浮层，焦点落到当前聚焦日那一格' },
    { id: 'date-range-picker.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in trigger, open', does: '收起浮层，焦点回到 trigger', restoresFocus: true },
    { id: 'date-range-picker.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点还给展开前那个控件（通常是 trigger），两端不变；区间挑到一半时先撤掉起点', restoresFocus: true },
    { id: 'date-range-picker.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点', restoresFocus: false },
    { id: 'date-range-picker.kbd.select', keys: ['Enter', 'Space'], when: 'open, focus in grid', does: '先落起点再落终点（由日历完成）；closeOnSelect 时两端都落定才收起浮层' },
    { id: 'date-range-picker.kbd.preset-move', keys: ['ArrowUp', 'ArrowDown', 'Home', 'End'], when: 'open, focus in 快捷选项列', does: '在快捷选项之间移动焦点，到头回绕；不写值' },
    { id: 'date-range-picker.kbd.preset-pick', keys: ['Enter', 'Space'], when: 'open, focus in 某条快捷选项', does: '把这条快捷选项的两端整份写进去；closeOnSelect 时收起浮层' },
    { id: 'date-range-picker.kbd.segment-open', keys: ['Alt+ArrowDown'], when: 'focus in 某一段, closed, not disabled', does: '展开浮层并把焦点移入；触发按钮是可选部件，键盘入口不能只挂在它上面' },
    { id: 'date-range-picker.kbd.segment-close', keys: ['Enter'], when: 'focus in 某一段, open', does: '收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势' },
  ],
}
