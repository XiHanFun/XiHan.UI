import type { KeyboardTable } from '../spec/types'

// 三类把手都是原生 button，敲 Enter / Space 由浏览器翻成 click，组件不另接键盘；
// 行里放什么控件、它们怎么响应键盘，归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const dynamicInputKeyboard: KeyboardTable = {
  component: 'dynamic-input',
  source: APG,
  rows: [],
}
