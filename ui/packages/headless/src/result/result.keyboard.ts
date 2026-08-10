import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

// 纯展示，自身不可聚焦、不接管按键；操作槽里的按钮由作者自己提供键盘语义。
export const resultKeyboard: KeyboardTable = {
  component: 'result',
  source: APG,
  rows: [],
}
