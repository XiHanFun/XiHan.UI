import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'

// 组件只监听"回到底部"那一个按钮。消息区的滚动全部走浏览器原生通路——
// 方向键、PageUp/PageDown、Home/End 一律不拦，这张表把这条约束记下来，
// 哪天有人在视口上加了 keydown 并 preventDefault，一致性用例会当场变红。
export const threadKeyboard: KeyboardTable = {
  component: 'thread',
  source: APG,
  rows: [
    { id: 'thread.kbd.viewport-tab', keys: ['Tab'], when: '焦点进入消息区', does: '消息区自身可聚焦，方向键/PageUp/PageDown 交给浏览器滚动，组件不接管' },
    { id: 'thread.kbd.scroll-button', keys: ['Space', 'Enter'], when: '焦点在"回到底部"按钮上', does: '滚回底部并重新粘附' },
  ],
}
