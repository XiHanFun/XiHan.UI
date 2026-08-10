import type { KeyboardTable } from '../spec/types'

// 版式只排字，不接收焦点；链接的键盘行为归浏览器的原生 a。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const typographyKeyboard: KeyboardTable = {
  component: 'typography',
  source: APG,
  rows: [],
}
