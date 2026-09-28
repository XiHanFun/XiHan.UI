/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 diff view 相关实现。

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
    { id: 'diff-view.kbd.press', keys: ['Enter', 'Space'], when: '按住展开按钮', does: '按住期间该格的 gap-trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或该格展开撤下' },
    { id: 'diff-view.kbd.comment-tab', keys: ['Tab'], when: '开了行评论', does: '一组评论钮只占一个 Tab 位：落在上次聚焦的那颗，它不在可见行里时落在第一颗' },
    { id: 'diff-view.kbd.comment-request', keys: ['Enter', 'Space'], when: '焦点在评论钮上', does: '报出 comment-request（这一行的侧、行号、变更类型与文本），走原生 button 的激活' },
    { id: 'diff-view.kbd.comment-move', keys: ['ArrowDown', 'ArrowUp'], when: '焦点在评论钮上', does: '移到下一颗 / 上一颗评论钮，到头不回绕；并排视图按先旧侧后新侧、逐行往下' },
    { id: 'diff-view.kbd.comment-edge', keys: ['Home', 'End'], when: '焦点在评论钮上', does: '移到第一颗 / 最后一颗评论钮' },
  ],
}
