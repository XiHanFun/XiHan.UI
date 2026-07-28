import type { KeyboardTable } from '../spec/types'

// 分段时间输入在 APG 里最贴近的模式是 spinbutton：每一段都是一个可加减的数，
// 段与段之间怎么走则是这里额外定义的部分。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction'

export const timeFieldKeyboard: KeyboardTable = {
  component: 'time-field',
  source: APG,
  rows: [
    { id: 'time-field.kbd.increment', keys: ['ArrowUp'], when: 'focus in a segment, not disabled/readOnly', does: '本段加一格，到头回绕；空段落到该段下界' },
    { id: 'time-field.kbd.decrement', keys: ['ArrowDown'], when: 'focus in a segment, not disabled/readOnly', does: '本段减一格，到头回绕；空段落到该段上界' },
    { id: 'time-field.kbd.next', keys: ['ArrowRight'], when: 'focus in a segment, not disabled', does: '焦点移到下一段；已在末段则不动，不回绕' },
    { id: 'time-field.kbd.prev', keys: ['ArrowLeft'], when: 'focus in a segment, not disabled', does: '焦点移到上一段；已在首段则不动，不回绕' },
    { id: 'time-field.kbd.first', keys: ['Home'], when: 'focus in a segment, not disabled', does: '焦点移到首段' },
    { id: 'time-field.kbd.last', keys: ['End'], when: 'focus in a segment, not disabled', does: '焦点移到末段' },
    { id: 'time-field.kbd.digit', keys: ['0-9'], when: 'focus in a 数字段, not disabled/readOnly', does: '把数字并进本段；本段再吃不下第二位时自动跳到下一段' },
    { id: 'time-field.kbd.clear', keys: ['Backspace', 'Delete'], when: 'focus in a segment, not disabled/readOnly', does: '清掉本段；小时被清时上下午段仍保留原来的上午/下午' },
    { id: 'time-field.kbd.period', keys: ['a', 'p'], when: 'focus in 上下午段, 12 小时制, not disabled/readOnly', does: 'a 取上午、p 取下午（不区分大小写）' },
  ],
}
