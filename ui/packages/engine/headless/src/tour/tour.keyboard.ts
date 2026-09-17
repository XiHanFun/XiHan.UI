/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tour 相关实现。

import type { KeyboardTable } from '../spec/types'

// APG 没有 tour 模式，键盘约定照 dialog 模式来（Escape 退出 + 焦点陷在浮层里），
// 多出来的只有 Enter/Space 推进一步。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

export const tourKeyboard: KeyboardTable = {
  component: 'tour',
  source: APG,
  rows: [
    { id: 'tour.kbd.next', keys: ['Enter', 'Space'], when: 'open 且焦点在 content 上（不在按钮等控件上）', does: '走到下一步；停在末步时完成引导并关闭' },
    { id: 'tour.kbd.escape', keys: ['Escape'], when: 'open 且 closeOnEscape', does: '放弃引导（发 onSkip）并关闭' },
    { id: 'tour.kbd.arrows', keys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], when: 'open', does: '一概不接管：既不换步也不阻止默认行为，留给页面滚动与读屏浏览' },
    { id: 'tour.kbd.trap', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '焦点陷在 content 内循环，跑出去会被拉回来' },
    { id: 'tour.kbd.press', keys: ['Enter', 'Space'], when: 'held in prev-trigger / next-trigger / skip-trigger / close-trigger', does: '按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或气泡收起撤下' },
  ],
}
