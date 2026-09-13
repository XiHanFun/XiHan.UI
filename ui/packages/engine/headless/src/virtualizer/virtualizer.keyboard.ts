/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 virtualizer 相关实现。

import type { KeyboardTable } from '../spec/types'

const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

/**
 * 空表，且必须一直是空的：本组件只是个滚动窗口，一个按键都不接管。
 * 滚动归浏览器，焦点移动归住在里面的那个组件，这里收按键会与内层组件抢同一个键。
 * 视口带 tabindex=0 是唯一动过的 Tab 序列。
 */
export const virtualizerKeyboard: KeyboardTable = {
  component: 'virtualizer',
  source: WCAG,
  rows: [],
}
