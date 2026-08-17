import type { KeyboardTable } from '../spec/types'

// APG 无分段日期模式，最接近的是 spinbutton：每一段都是 role=spinbutton，
// 这里额外定义的只是段与段之间怎么走。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'

export const dateFieldKeyboard: KeyboardTable = {
  component: 'date-field',
  source: APG,
  rows: [
    { id: 'date-field.kbd.increment', keys: ['ArrowUp'], when: 'focus in a segment, not disabled/readOnly', does: '本段加一，到区间上界回绕到下界；空段则落到今天的对应位' },
    { id: 'date-field.kbd.decrement', keys: ['ArrowDown'], when: 'focus in a segment, not disabled/readOnly', does: '本段减一，到区间下界回绕到上界；空段则落到今天的对应位' },
    { id: 'date-field.kbd.next', keys: ['ArrowRight'], when: 'focus in a segment, not disabled', does: '焦点移到下一段（跳过收起的段）；已在末段则不动，不回绕' },
    { id: 'date-field.kbd.prev', keys: ['ArrowLeft'], when: 'focus in a segment, not disabled', does: '焦点移到上一段；已在首段则不动，不回绕' },
    { id: 'date-field.kbd.first', keys: ['Home'], when: 'focus in a segment, not disabled', does: '焦点移到首段' },
    { id: 'date-field.kbd.last', keys: ['End'], when: 'focus in a segment, not disabled', does: '焦点移到末段' },
    { id: 'date-field.kbd.clear', keys: ['Backspace'], when: 'focus in a segment, not disabled/readOnly', does: '清掉本段，焦点不动；整份值随之变成 null' },
    { id: 'date-field.kbd.digit', keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], when: 'focus in a segment, not disabled/readOnly', does: '往本段补一位数字；补满（再补一位必溢出或位数用尽）即自动跳下一段。上下午段没有数字位，不收数字' },
    { id: 'date-field.kbd.day-period', keys: ['a', 'p'], when: 'focus in 上下午段, not disabled/readOnly', does: '直接指定上午 / 下午；上下键在两者之间翻面' },
  ],
}
