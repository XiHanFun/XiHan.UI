/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 prompt input 相关实现。

import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard'

export const promptInputKeyboard: KeyboardTable = {
  component: 'prompt-input',
  source: WCAG,
  rows: [
    { id: 'prompt-input.kbd.enter', keys: ['Enter'], when: '焦点在输入框、submitKey 为 enter、非组合态、可提交，且这一下还没被别的处理器处理过', does: '提交，并按 clearOnSubmit 决定清不清空' },
    { id: 'prompt-input.kbd.shift-enter', keys: ['Shift+Enter'], when: '焦点在输入框', does: '不归组件管：原样放行，浏览器插入换行' },
    { id: 'prompt-input.kbd.mod-enter', keys: ['Control+Enter', 'Meta+Enter'], when: '焦点在输入框、submitKey 为 enter 或 mod-enter、非组合态、可提交', does: '提交，并按 clearOnSubmit 决定清不清空' },
    { id: 'prompt-input.kbd.none', keys: ['Enter', 'Control+Enter', 'Meta+Enter'], when: '焦点在输入框、submitKey 为 none', does: '都不提交也不拦截：原样放行，浏览器插入换行；提交只剩按钮与程序化两条路' },
    { id: 'prompt-input.kbd.ime-enter', keys: ['Enter'], when: '输入法组合中', does: '不提交也不拦截：这一下是在确认候选词' },
    { id: 'prompt-input.kbd.yield', keys: ['Enter'], when: '同一个输入框上叠了别的处理器且它已经处理过这一下', does: '让位，本组件什么都不做' },
    { id: 'prompt-input.kbd.submit-press', keys: ['Enter', 'Space'], when: '焦点在发送按钮上', does: '按当前身份触发提交或停止（原生按钮激活）' },
    { id: 'prompt-input.kbd.press', keys: ['Enter', 'Space'], when: 'held on submit-trigger, not disabled（发送身份要可提交，停止身份恒可用）', does: '按住期间按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，身份随 loading 切换或提交后清空使按钮转禁用时一并撤下' },
    { id: 'prompt-input.kbd.escape', keys: ['Escape'], when: '任何时候', does: '不接管：留给叠在输入框上的浮层与页面' },
  ],
}
