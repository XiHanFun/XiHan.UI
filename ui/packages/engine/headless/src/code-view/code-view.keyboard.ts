import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 组件只让 pre 占一个 Tab 停靠点，横向滚动交给浏览器；折叠按钮走原生激活。
export const codeViewKeyboard: KeyboardTable = {
  component: 'code-view',
  source: WCAG,
  rows: [
    { id: 'code-view.kbd.pre-focus', keys: ['Tab'], when: '代码块在 Tab 序列中', does: '<pre> 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管' },
    { id: 'code-view.kbd.fold', keys: ['Enter', 'Space'], when: '焦点在折叠按钮上', does: '翻面折叠态并发出意图；组件只接 click，按键走原生 button 的默认行为' },
  ],
}
