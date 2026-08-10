import type { KeyboardTable } from '../spec/types'

// 时间线是一份已经发生的事件清单，自身不可聚焦、不接管按键；
// 条目里放的链接、按钮由那些控件自己负责键盘语义。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const timelineKeyboard: KeyboardTable = {
  component: 'timeline',
  source: APG,
  rows: [],
}
