/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { KeyboardTable } from '../spec/types'

// 没开预览时是纯展示，不可聚焦。开了预览，整张图是一个自定义按钮（role=button），键盘契约按 Button 模式立；
// 预览层里的键盘归图片预览组件。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

export const imageKeyboard: KeyboardTable = {
  component: 'image',
  source: APG,
  rows: [
    {
      id: 'image.kbd.tab',
      keys: ['Tab', 'Shift+Tab'],
      when: 'preview enabled',
      does: '整张图片占一个 Tab 位；没开预览、或没有可看的图时不可聚焦',
    },
    {
      id: 'image.kbd.open-preview',
      keys: ['Enter', 'Space'],
      when: 'focus on root (preview enabled)',
      does: '打开大图预览。root 是 div，浏览器不会替它把这两个键合成成一次点击，连接层自己接管（并拦下空格滚屏）；预览层关上后焦点回到图片',
    },
  ],
}
