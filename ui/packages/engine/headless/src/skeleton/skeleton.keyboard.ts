/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 skeleton 相关实现。

import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

// 骨架屏不接管任何按键，也不进 Tab 序列
export const skeletonKeyboard: KeyboardTable = {
  component: 'skeleton',
  source: APG,
  rows: [],
}
