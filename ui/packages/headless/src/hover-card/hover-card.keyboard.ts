import type { KeyboardTable } from '../spec/types'

// 无对应 APG 模式：卡片本体是非模态对话框，键盘语义按 dialog 的这一节对齐。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const hoverCardKeyboard: KeyboardTable = {
  component: 'hover-card',
  source: APG,
  rows: [
    { id: 'hover-card.kbd.focus-trigger', keys: ['Tab', 'Shift+Tab'], when: 'not disabled', does: '焦点进入 trigger 立即展开、离开卡片即收起，都不走延时' },
    { id: 'hover-card.kbd.escape', keys: ['Escape'], when: '浮层可见（含收起等待期）', does: '立即收起，不等 closeDelay' },
  ],
}
