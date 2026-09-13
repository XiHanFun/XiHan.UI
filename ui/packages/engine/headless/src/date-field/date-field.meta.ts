/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date field 相关实现。

import type { ComponentMeta } from '../spec/types'

// label 与 hidden-input 由作者按需要挂。
export const dateFieldMeta: ComponentMeta = {
  component: 'date-field',
  requiredParts: ['root', 'control', 'segment'],
}
