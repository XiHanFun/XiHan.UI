import type { KeyboardTable } from '../spec/types'

// 图标底座是展示节点，不接收焦点，也不接管任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const iconWrapperKeyboard: KeyboardTable = {
  component: 'icon-wrapper',
  source: APG,
  rows: [],
}
