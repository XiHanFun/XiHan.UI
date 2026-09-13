/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pin input 相关实现。

import type { ComponentMeta } from '../spec/types'

// label 与 hidden-input 由作者按需要挂。
export const pinInputMeta: ComponentMeta = {
  component: 'pin-input',
  requiredParts: ['root', 'input'],
}
