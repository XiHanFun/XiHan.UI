import type { KeyboardTable } from '../spec/types'

// 按钮组是容器，不接收焦点；每一段仍是各自独立的按钮，Tab 逐个停留、按键归按钮自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const buttonGroupKeyboard: KeyboardTable = {
  component: 'button-group',
  source: APG,
  rows: [],
}
