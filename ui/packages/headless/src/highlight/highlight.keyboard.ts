import type { KeyboardTable } from '../spec/types'

// 高亮是一段文本，不可聚焦、不接任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const highlightKeyboard: KeyboardTable = {
  component: 'highlight',
  source: APG,
  rows: [],
}
