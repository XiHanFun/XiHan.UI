import type { KeyboardTable } from '../spec/types'

// 描述列表是只读排版，不接收焦点；取值里放了链接还是按钮，键盘响应归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const descriptionsKeyboard: KeyboardTable = {
  component: 'descriptions',
  source: APG,
  rows: [],
}
