import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'

// 组件只监听回到底部按钮，消息区的滚动按键全部交给浏览器。
export const threadKeyboard: KeyboardTable = {
  component: 'thread',
  source: APG,
  rows: [
    { id: 'thread.kbd.viewport-tab', keys: ['Tab'], when: '焦点进入消息区', does: '消息区自身可聚焦，方向键/PageUp/PageDown 交给浏览器滚动，组件不接管' },
    { id: 'thread.kbd.scroll-button', keys: ['Space', 'Enter'], when: '焦点在"回到底部"按钮上', does: '滚回底部并重新粘附' },
  ],
}
