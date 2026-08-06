import type { KeyboardTable } from '../spec/types'

// 不可聚焦、不接任何键，出处指向活区的实践章节。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

export const spinnerKeyboard: KeyboardTable = {
  component: 'spinner',
  source: APG,
  rows: [],
}
