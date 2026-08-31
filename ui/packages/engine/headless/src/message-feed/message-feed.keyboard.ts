import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/feed/'

// 与 APG 示例刻意偏离一处：示例给每个 article 都写 tabindex="0"，两百条消息就是两百个 Tab 停靠位。
// 这里改用 roving tabindex，与仓内 listbox / toolbar / side-nav 一致。
export const messageFeedKeyboard: KeyboardTable = {
  component: 'message-feed',
  source: APG,
  rows: [
    { id: 'message-feed.kbd.next', keys: ['PageDown'], when: '焦点在消息流内', does: '焦点移到下一条消息；到末条时按 loop 决定回绕还是不动' },
    { id: 'message-feed.kbd.prev', keys: ['PageUp'], when: '焦点在消息流内', does: '焦点移到上一条消息；到首条时按 loop 决定回绕还是不动' },
    { id: 'message-feed.kbd.exit-after', keys: ['Control+End'], when: '焦点在消息流内', does: '焦点移到消息流之后的第一个可聚焦元素，会话界面里通常是输入框' },
    { id: 'message-feed.kbd.exit-before', keys: ['Control+Home'], when: '焦点在消息流内', does: '焦点移到消息流之前的最后一个可聚焦元素' },
    { id: 'message-feed.kbd.tab', keys: ['Tab'], when: '焦点在消息流内外之间移动', does: '整份消息列表只占一个 Tab 停靠位：没有锚点时由根容器认领并把焦点转投给第一条，有锚点时那一条认领、根容器让位' },
    { id: 'message-feed.kbd.scroll', keys: ['ArrowUp', 'ArrowDown', 'Home', 'End'], when: '焦点落在某条消息上', does: '组件不接管，浏览器滚动最近的可滚动祖先' },
    { id: 'message-feed.kbd.scroll-button', keys: ['Enter', 'Space'], when: '焦点在回到底部按钮上', does: '滚回底部并恢复粘附（原生按钮激活）' },
  ],
}
