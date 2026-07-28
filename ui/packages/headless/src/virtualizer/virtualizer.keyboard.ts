import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

/**
 * 空表，且必须一直是空的：本组件只是个滚动窗口，一个按键都不接管。
 *
 * 滚动本身归浏览器（视口是原生的 overflow 容器），焦点移动归住在里面的那个组件
 * （listbox / tree / grid 各有各的方向键语义）。这里若开始收按键，就会与内层组件抢同一个键。
 * 视口带 tabindex=0 是唯一动过的 Tab 序列，一致性套件会验它，也会验按键没被拦下。
 */
export const virtualizerKeyboard: KeyboardTable = {
  component: 'virtualizer',
  source: WCAG,
  rows: [],
}
