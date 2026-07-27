import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

// 纯展示，不可聚焦，无键盘交互。
export const imageKeyboard: KeyboardTable = {
  component: 'image',
  source: APG,
  rows: [],
}
