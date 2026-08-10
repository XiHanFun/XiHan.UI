import type { KeyboardTable } from '../spec/types'

// 吸附只改内容的落位，不接收焦点、不接管按键；里面放什么控件、怎么响应键盘，归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const affixKeyboard: KeyboardTable = {
  component: 'affix',
  source: APG,
  rows: [],
}
