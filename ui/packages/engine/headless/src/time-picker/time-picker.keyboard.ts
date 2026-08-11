import type { KeyboardTable } from '../spec/types'

// 浮层里几列并排的 listbox 按 listbox 那一套，输入行里的分段按 spinbutton 那一套；
// 两套在这张表里合流，source 取占主导的那一份。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction'

export const timePickerKeyboard: KeyboardTable = {
  component: 'time-picker',
  source: APG,
  rows: [
    { id: 'time-picker.kbd.open', keys: ['ArrowDown', 'ArrowUp'], when: 'focus in trigger, closed, not disabled', does: '展开浮层，焦点落到时列（已选的时仍可选就停在它上面，否则停在首格）' },
    { id: 'time-picker.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in trigger, not disabled', does: '按钮的默认激活即展开/收起（不额外拦键，否则会一开一关）' },
    { id: 'time-picker.kbd.item-next', keys: ['ArrowDown'], when: 'open, focus in 某一列', does: '列内下移一格，到尾回绕；被 min/max 裁掉的格自动跳过' },
    { id: 'time-picker.kbd.item-prev', keys: ['ArrowUp'], when: 'open, focus in 某一列', does: '列内上移一格，到头回绕；被 min/max 裁掉的格自动跳过' },
    { id: 'time-picker.kbd.item-first', keys: ['Home'], when: 'open, focus in 某一列', does: '焦点移到本列首格' },
    { id: 'time-picker.kbd.item-last', keys: ['End'], when: 'open, focus in 某一列', does: '焦点移到本列末格' },
    { id: 'time-picker.kbd.column-next', keys: ['ArrowRight'], when: 'open', does: '换到下一列并落在该列的锚点上；已在末列则不动，不回绕' },
    { id: 'time-picker.kbd.column-prev', keys: ['ArrowLeft'], when: 'open', does: '换到上一列并落在该列的锚点上；已在首列则不动，不回绕' },
    { id: 'time-picker.kbd.select', keys: ['Enter', 'Space'], when: 'open, 焦点停在可选的格上, not disabled/readOnly', does: '把这一格写进对应的段；浮层不收起（其余列还要接着挑）' },
    { id: 'time-picker.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点归还触发器，值不变' },
    { id: 'time-picker.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起浮层且不拦按键，焦点按 Tab 序列自然离开，不抢回触发器' },
    { id: 'time-picker.kbd.segment-increment', keys: ['ArrowUp'], when: 'focus in 某一段, not disabled/readOnly', does: '本段加一格，到头回绕；空段落到该段下界' },
    { id: 'time-picker.kbd.segment-decrement', keys: ['ArrowDown'], when: 'focus in 某一段, not disabled/readOnly', does: '本段减一格，到头回绕；空段落到该段上界' },
    { id: 'time-picker.kbd.segment-next', keys: ['ArrowRight'], when: 'focus in 某一段, not disabled', does: '焦点移到下一段；已在末段则不动，不回绕' },
    { id: 'time-picker.kbd.segment-prev', keys: ['ArrowLeft'], when: 'focus in 某一段, not disabled', does: '焦点移到上一段；已在首段则不动，不回绕' },
    { id: 'time-picker.kbd.segment-first', keys: ['Home'], when: 'focus in 某一段, not disabled', does: '焦点移到首段' },
    { id: 'time-picker.kbd.segment-last', keys: ['End'], when: 'focus in 某一段, not disabled', does: '焦点移到末段' },
    { id: 'time-picker.kbd.segment-digit', keys: ['0-9'], when: 'focus in 数字段, not disabled/readOnly', does: '把数字并进本段；本段再吃不下第二位时自动跳到下一段' },
    { id: 'time-picker.kbd.segment-clear', keys: ['Backspace', 'Delete'], when: 'focus in 某一段, not disabled/readOnly', does: '清掉本段；小时被清时上下午段仍保留原来的上午/下午' },
    { id: 'time-picker.kbd.segment-period', keys: ['a', 'p'], when: 'focus in 上下午段, 12 小时制, not disabled/readOnly', does: 'a 取上午、p 取下午（不区分大小写）' },
  ],
}
