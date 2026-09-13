/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 number animation 相关实现。

import type { KeyboardTable } from '../spec/types'

// 一段会变的文字，不可聚焦、不接任何按键；出处指向 ARIA 的 status 角色。
const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#status'

export const numberAnimationKeyboard: KeyboardTable = {
  component: 'number-animation',
  source: SPEC,
  rows: [],
}
