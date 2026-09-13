/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { KeyboardTable } from '../spec/types'

// 水印只往内容上盖一层印子，不可聚焦、不接管按键；被盖住的内容照常用键盘操作。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const watermarkKeyboard: KeyboardTable = {
  component: 'watermark',
  source: APG,
  rows: [],
}
