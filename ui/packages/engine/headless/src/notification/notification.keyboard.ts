/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 notification 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

// 通知不抢焦点、也不是层，没有打开或关闭它的全局键；队列容器是地标，不做方向键导航。
// 键盘可达的是卡片里那两颗原生按钮（激活由平台负责），以及叠放的一摞里 Escape 收起。
export const notificationKeyboard: KeyboardTable = {
  component: 'notification',
  source: APG,
  rows: [
    {
      id: 'notification.kbd.close',
      keys: ['Enter', 'Space'],
      when: 'focus 在 item-close-trigger 上且 closable',
      does: '立即进入 dismissing，退场动画播完后转 unmounted',
    },
    {
      id: 'notification.kbd.action',
      keys: ['Enter', 'Space'],
      when: 'focus 在 item-action-trigger 上',
      does: '触发 onAction 并进入 dismissing',
    },
    {
      id: 'notification.kbd.press',
      keys: ['Enter', 'Space'],
      when: 'held in item-close-trigger / item-action-trigger（item-close-trigger 须 closable）',
      does: '按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或进入退场撤下',
    },
    {
      id: 'notification.kbd.collapse',
      keys: ['Escape'],
      when: 'focus 在叠放的一摞（stacked）里',
      does: '收起展开的一摞，焦点离开卡片；整摞的计时随之放开',
    },
  ],
}
