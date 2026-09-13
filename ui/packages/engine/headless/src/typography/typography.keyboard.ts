/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 typography 相关实现。

import type { KeyboardTable } from '../spec/types'

// 版式只排字，不接收焦点；链接的键盘行为归浏览器的原生 a。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const typographyKeyboard: KeyboardTable = {
  component: 'typography',
  source: APG,
  rows: [],
}
