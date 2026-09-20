/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 log 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'

// 组件一个按键都不接管：日志区自身可聚焦，滚动全部走浏览器原生通路，
// 回到底部按钮是原生 button，由浏览器激活。
export const logKeyboard: KeyboardTable = {
  component: 'log',
  source: APG,
  rows: [
    {
      id: 'log.kbd.viewport-tab',
      keys: ['Tab'],
      when: '焦点进入日志区',
      does: '日志区自身可聚焦，方向键/PageUp/PageDown/Home/End 交给浏览器滚动，组件不接管',
    },
    {
      id: 'log.kbd.scroll-to-end-trigger',
      keys: ['Space', 'Enter'],
      when: '焦点在"回到底部"按钮上',
      does: '滚回底部并重新粘附',
    },
    {
      id: 'log.kbd.press',
      keys: ['Space', 'Enter'],
      when: '按住"回到底部"按钮且视口不在底部',
      does: '按住期间 scroll-to-end-trigger 投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或回到底部（按钮收起）撤下',
    },
  ],
}
