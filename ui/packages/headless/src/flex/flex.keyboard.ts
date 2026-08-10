import type { KeyboardTable } from '../spec/types'

// 排版容器不接收焦点；里面放什么控件、怎么响应键盘，归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const flexKeyboard: KeyboardTable = {
  component: 'flex',
  source: APG,
  rows: [],
}
