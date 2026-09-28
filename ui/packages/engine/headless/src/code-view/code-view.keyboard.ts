/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

// 组件只让 pre 占一个 Tab 停靠点，横向滚动交给浏览器；折叠按钮走原生激活。
// 开了按块折叠时，行首折叠钮合起来再占一个 Tab 位，组内用上下方向键走。
export const codeViewKeyboard: KeyboardTable = {
  component: 'code-view',
  source: WCAG,
  rows: [
    { id: 'code-view.kbd.pre-focus', keys: ['Tab'], when: '代码块在 Tab 序列中', does: '<pre> 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管' },
    { id: 'code-view.kbd.fold', keys: ['Enter', 'Space'], when: '焦点在折叠按钮上', does: '翻面折叠态并发出意图；组件只接 click，按键走原生 button 的默认行为' },
    { id: 'code-view.kbd.press', keys: ['Enter', 'Space'], when: '按住折叠按钮且代码可折叠', does: '按住期间 fold-trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或折叠条收起撤下' },
    { id: 'code-view.kbd.block-fold-tab', keys: ['Tab'], when: '开了按块折叠', does: '一组行首折叠钮只占一个 Tab 位：落在上次聚焦的那颗，它被收起或不再是块头时落在第一颗看得见的钮上' },
    { id: 'code-view.kbd.block-fold-toggle', keys: ['Enter', 'Space'], when: '焦点在行首折叠钮上', does: '折叠或展开这个语法块，走原生 button 的激活' },
    { id: 'code-view.kbd.block-fold-move', keys: ['ArrowDown', 'ArrowUp'], when: '焦点在行首折叠钮上', does: '移到下一颗 / 上一颗看得见的折叠钮，收起在块里的跳过；到头不回绕' },
    { id: 'code-view.kbd.block-fold-edge', keys: ['Home', 'End'], when: '焦点在行首折叠钮上', does: '移到第一颗 / 最后一颗看得见的折叠钮' },
  ],
}
