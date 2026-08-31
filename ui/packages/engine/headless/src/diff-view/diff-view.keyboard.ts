import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 刻意不采表格那套行级 roving：只读差异不是网格，给每份差异一个吞方向键的焦点组
// 会把页面滚动抢走，而读屏本来就有表格浏览模式。这是显式裁决，不是遗漏。
export const diffViewKeyboard: KeyboardTable = {
  component: 'diff-view',
  source: WCAG,
  rows: [
    { id: 'diff-view.kbd.viewport-focus', keys: ['Tab'], when: '差异视图在 Tab 序列中', does: '滚动容器自身可聚焦，随后方向键的横纵滚动交给浏览器，组件不接管' },
    { id: 'diff-view.kbd.expand-gap', keys: ['Enter', 'Space'], when: '焦点在展开按钮上', does: '展开该处折起来的上下文行；组件只接 click，按键走原生 button 的默认行为' },
  ],
}
