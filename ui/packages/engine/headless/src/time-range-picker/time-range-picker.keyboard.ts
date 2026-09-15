/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { KeyboardTable } from '../spec/types'

// 浮层里两组并排的 listbox 按 listbox 那一套，输入行里的两组分段按 spinbutton 那一套；
// 两套在这张表里合流，source 取占主导的那一份。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction'

export const timeRangePickerKeyboard: KeyboardTable = {
  component: 'time-range-picker',
  source: APG,
  rows: [
    { id: 'time-range-picker.kbd.open', keys: ['ArrowDown', 'ArrowUp'], when: 'focus in trigger, closed, not disabled', does: '展开浮层，焦点落到起点那组的时列（已选的时仍可选就停在它上面，否则停在首格）' },
    { id: 'time-range-picker.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in trigger, not disabled', does: '按钮的默认激活即展开/收起（不额外拦键，否则会一开一关）' },
    { id: 'time-range-picker.kbd.item-next', keys: ['ArrowDown'], when: 'open, focus in 某一列', does: '列内下移一格，到尾回绕；被 min/max 或另一端禁用的格自动跳过' },
    { id: 'time-range-picker.kbd.item-prev', keys: ['ArrowUp'], when: 'open, focus in 某一列', does: '列内上移一格，到头回绕；被 min/max 或另一端禁用的格自动跳过' },
    { id: 'time-range-picker.kbd.item-first', keys: ['Home'], when: 'open, focus in 某一列', does: '焦点移到本列首格' },
    { id: 'time-range-picker.kbd.item-last', keys: ['End'], when: 'open, focus in 某一列', does: '焦点移到本列末格' },
    { id: 'time-range-picker.kbd.column-next', keys: ['ArrowRight'], when: 'open', does: '换到下一列并落在该列的锚点上；起点那组的末列再往右进终点那组，已在最后一列则不动，不回绕' },
    { id: 'time-range-picker.kbd.column-prev', keys: ['ArrowLeft'], when: 'open', does: '换到上一列并落在该列的锚点上；终点那组的首列再往左回起点那组，已在第一列则不动，不回绕' },
    { id: 'time-range-picker.kbd.select', keys: ['Enter', 'Space'], when: 'open, 焦点停在可选的格上, not disabled/readOnly', does: '把这一格写进对应那一端的段；浮层不收起（其余列与另一端还要接着挑）' },
    { id: 'time-range-picker.kbd.preset-move', keys: ['ArrowUp', 'ArrowDown', 'Home', 'End'], when: 'open, focus in 快捷选项列', does: '在快捷选项之间移动焦点，到头回绕；时分秒那几列的处理器在这一列内不参与' },
    { id: 'time-range-picker.kbd.preset-pick', keys: ['Enter', 'Space'], when: 'open, focus in 某条快捷选项, not disabled/readOnly', does: '把这条快捷选项的两端整份写进值并收起浮层' },
    { id: 'time-range-picker.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点归还触发器，两端不变', restoresFocus: true },
    { id: 'time-range-picker.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起浮层且不拦按键，焦点按 Tab 序列自然离开，不抢回触发器', restoresFocus: false },
    { id: 'time-range-picker.kbd.segment-increment', keys: ['ArrowUp'], when: 'focus in 某一段, not disabled/readOnly', does: '本段加一格，到头回绕；空段落到该段下界' },
    { id: 'time-range-picker.kbd.segment-decrement', keys: ['ArrowDown'], when: 'focus in 某一段, not disabled/readOnly', does: '本段减一格，到头回绕；空段落到该段上界' },
    { id: 'time-range-picker.kbd.segment-next', keys: ['ArrowRight'], when: 'focus in 某一段, not disabled', does: '焦点移到本组下一段；已在本组末段则不动，不跨进另一端那组' },
    { id: 'time-range-picker.kbd.segment-prev', keys: ['ArrowLeft'], when: 'focus in 某一段, not disabled', does: '焦点移到本组上一段；已在本组首段则不动，不跨回另一端那组' },
    { id: 'time-range-picker.kbd.segment-first', keys: ['Home'], when: 'focus in 某一段, not disabled', does: '焦点移到本组首段' },
    { id: 'time-range-picker.kbd.segment-last', keys: ['End'], when: 'focus in 某一段, not disabled', does: '焦点移到本组末段' },
    { id: 'time-range-picker.kbd.segment-digit', keys: ['0-9'], when: 'focus in 数字段, not disabled/readOnly', does: '把数字并进本段；本段再吃不下第二位时自动跳到本组下一段' },
    { id: 'time-range-picker.kbd.segment-clear', keys: ['Backspace', 'Delete'], when: 'focus in 某一段, not disabled/readOnly', does: '清掉本段；小时被清时上下午段仍保留原来的上午/下午' },
    { id: 'time-range-picker.kbd.segment-period', keys: ['a', 'p'], when: 'focus in 上下午段, 12 小时制, not disabled/readOnly', does: 'a 取上午、p 取下午（不区分大小写）' },
    { id: 'time-range-picker.kbd.segment-open', keys: ['Alt+ArrowDown'], when: 'focus in 某一段, closed, not disabled', does: '展开浮层并把焦点移入正在编辑一端的时列；触发按钮是可选部件，键盘入口不能只挂在它上面' },
    { id: 'time-range-picker.kbd.segment-close', keys: ['Enter'], when: 'focus in 某一段, open', does: '收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势' },
  ],
}
