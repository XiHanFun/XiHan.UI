/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 clipboard 相关实现。

import type { KeyboardTable } from '../spec/types'

// 激活归平台：复制按钮与只读展示框都是原生元素；本组件只接按住期间的按压面。
const SPEC = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element'

export const clipboardKeyboard: KeyboardTable = {
  component: 'clipboard',
  source: SPEC,
  rows: [
    { id: 'clipboard.kbd.press', keys: ['Enter', 'Space'], when: 'held in copy-trigger, not disabled, not copying', does: '按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下' },
  ],
}
