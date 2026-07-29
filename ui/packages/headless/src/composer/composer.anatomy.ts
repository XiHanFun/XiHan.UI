import { createAnatomy } from '@xihan-ui/core'

// 没有独立的 stop-trigger：流式期间发送按钮原位改成「停止」，只换 aria-label 与 data-mode。
// 拆成两个 part 就意味着一个卸载、另一个挂载，按钮在 DOM 里换了位置，焦点随之掉回 body，
// 键盘用户按完发送想接着按停止时，Tab 序已经变了。
export const composerAnatomy = createAnatomy('composer', ['root', 'input', 'submit-trigger'])
