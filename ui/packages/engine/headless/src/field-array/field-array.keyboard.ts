/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { KeyboardTable } from '../spec/types'

// 四类把手都是原生 button，敲 Enter / Space 由浏览器翻成 click，组件只接按压通道（按住投影 data-pressed）；
// 行里放什么控件、它们怎么响应键盘，归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const fieldArrayKeyboard: KeyboardTable = {
  component: 'field-array',
  source: APG,
  rows: [
    {
      id: 'field-array.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held on add-trigger / item-delete-trigger / move-up-trigger / move-down-trigger, not aria-disabled',
      does: '按住期间该把手投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，删除 / 换序落地后把手随行离场或换位时一并撤下',
    },
  ],
}
