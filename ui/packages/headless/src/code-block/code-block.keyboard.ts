import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 组件不监听任何按键，只让 pre 占一个 Tab 停靠点，横向滚动交给浏览器。
export const codeBlockKeyboard: KeyboardTable = {
  component: 'code-block',
  source: WCAG,
  rows: [
    { id: 'code-block.kbd.pre-focus', keys: ['Tab'], when: '代码块在 Tab 序列中', does: '<pre> 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管' },
  ],
}
