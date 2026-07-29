import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label'

// 本表只列编排机接管的按键：浮层的开合、收起与焦点去处。
// 网格内的方向键、翻页键与确认键见 calendar 键盘表，段位上的按键见 date-field 键盘表。
export const datePickerKeyboard: KeyboardTable = {
  component: 'date-picker',
  source: APG,
  rows: [
    { id: 'date-picker.kbd.open', keys: ['Enter', 'Space'], when: 'focus in trigger, closed', does: '展开日历浮层，焦点落到当前聚焦日那一格' },
    { id: 'date-picker.kbd.toggle', keys: ['Enter', 'Space'], when: 'focus in trigger, open', does: '收起浮层，焦点回到 trigger' },
    { id: 'date-picker.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层并把焦点还给展开前那个控件（通常是 trigger），选中值不变' },
    { id: 'date-picker.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点' },
    { id: 'date-picker.kbd.select', keys: ['Enter', 'Space'], when: 'open, focus in grid', does: '选中聚焦日（由日历完成）；closeOnSelect 时收起浮层——区间要两端都落定才算选完' },
  ],
}
