/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd 相关实现。

import type { KeyboardTable } from '../spec/types'

export const kbdKeyboard: KeyboardTable = {
  component: 'kbd',
  source: 'https://www.w3.org/TR/uievents/#event-type-keydown',
  rows: [
    {
      id: 'kbd.keydown.trigger',
      keys: ['keys 指定的组合'],
      when: 'register 开启、enabled 未关，且不在输入法组合期',
      does: '触发 onHotKey；preventDefault 开启（默认）时同时拦下浏览器默认动作',
    },
    {
      id: 'kbd.keydown.typing',
      keys: ['keys 指定的组合'],
      when: '组合里没有 Ctrl / Meta / Alt，且按键落在输入区里',
      does: '不触发也不拦截，输入优先',
    },
  ],
}
