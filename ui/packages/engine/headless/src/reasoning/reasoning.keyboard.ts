/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 reasoning 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

// 除下面这一行外一律不接管、不 preventDefault。
export const reasoningKeyboard: KeyboardTable = {
  component: 'reasoning',
  source: APG,
  rows: [
    { id: 'reasoning.kbd.toggle', keys: ['Enter', 'Space'], when: '焦点在折叠开关上且未禁用', does: '展开或收起思考正文，并把自动开合永久停用' },
    { id: 'reasoning.kbd.press', keys: ['Enter', 'Space'], when: '按住折叠开关且未禁用', does: '按住期间 trigger 投影 data-pressed，与指针 :active 同一副按压面（disclosure trigger 只换面不缩放）；抬起、失焦或转禁用撤下。思考中照常接' },
  ],
}
