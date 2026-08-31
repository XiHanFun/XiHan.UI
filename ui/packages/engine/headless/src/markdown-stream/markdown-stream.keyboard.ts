import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 组件不接管任何按键：正文里的链接与代码块各自提供自己的停靠点。
export const markdownStreamKeyboard: KeyboardTable = {
  component: 'markdown-stream',
  source: WCAG,
  rows: [
    { id: 'markdown-stream.kbd.none', keys: [], when: '任何时候', does: '组件不接管任何按键；块内的链接、代码块各自的停靠点由它们自己提供' },
  ],
}
