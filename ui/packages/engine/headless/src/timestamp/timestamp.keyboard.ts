import type { KeyboardTable } from '../spec/types'

// 时间戳是一段文本，不可聚焦、不接任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const timestampKeyboard: KeyboardTable = {
  component: 'timestamp',
  source: APG,
  rows: [],
}
