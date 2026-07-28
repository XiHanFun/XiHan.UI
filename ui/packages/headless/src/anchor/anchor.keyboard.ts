import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html'

// 锚点导航不接管任何按键：可点的部件是原生 <a href="#id">，激活与 Tab 序列全部由平台提供。
// 刻意不做 roving tabindex——目录的每一条都是一个独立的去处，
// 套上 roving 之后用户按一次 Tab 只能进组，再也没法直接 Tab 到某一节。
export const anchorKeyboard: KeyboardTable = {
  component: 'anchor',
  source: APG,
  rows: [
    { id: 'anchor.kbd.link', keys: ['Enter'], when: 'focus in link', does: '跳到目标区块：smooth 关时由原生 <a href="#id"> 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器）' },
    { id: 'anchor.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus in root', does: '逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点' },
  ],
}
