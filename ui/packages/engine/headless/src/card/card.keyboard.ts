/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 card 相关实现。

import type { KeyboardTable } from '../spec/types'

// 卡片是容器，自己不接收焦点；整卡可交互时焦点落在标题里的 trigger 上，那是原生链接或按钮，
// 激活由平台完成。里面另放的控件怎么响应键盘，归那些控件自己。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const cardKeyboard: KeyboardTable = {
  component: 'card',
  source: APG,
  rows: [
    { id: 'card.kbd.activate', keys: ['Enter', 'Space'], when: 'focus on trigger', does: '原生激活：链接只认 Enter 并跳转，按钮 Enter 与 Space 都认；整张卡片只有 trigger 这一个 Tab 位' },
  ],
}
