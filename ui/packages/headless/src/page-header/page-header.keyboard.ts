import type { KeyboardTable } from '../spec/types'

// 页头是容器，不接收焦点；返回位是作者自己的按钮，它怎么响应键盘归它自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const pageHeaderKeyboard: KeyboardTable = {
  component: 'page-header',
  source: APG,
  rows: [],
}
