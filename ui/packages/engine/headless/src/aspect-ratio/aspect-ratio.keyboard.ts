/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 aspect ratio 相关实现。

import type { KeyboardTable } from '../spec/types'

// 宽高比盒子只定形状，不可聚焦、不接任何按键。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const aspectRatioKeyboard: KeyboardTable = {
  component: 'aspect-ratio',
  source: APG,
  rows: [],
}
