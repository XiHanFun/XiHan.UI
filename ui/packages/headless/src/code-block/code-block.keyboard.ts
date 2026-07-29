import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 只有一行，而且必须一直只有这一行：组件不监听任何按键。
// 代码块唯一动过的是 Tab 序列（pre 占一个停靠点），横向滚动归浏览器。
// 哪天有人在 pre 上加了 keydown 并 preventDefault，一致性用例会当场变红。
export const codeBlockKeyboard: KeyboardTable = {
  component: 'code-block',
  source: WCAG,
  rows: [
    { id: 'code-block.kbd.pre-focus', keys: ['Tab'], when: '代码块在 Tab 序列中', does: '<pre> 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管' },
  ],
}
