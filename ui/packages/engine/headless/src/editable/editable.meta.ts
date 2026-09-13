/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 editable 相关实现。

import type { ComponentMeta } from '../spec/types'

// 两个形态各缺一不可：没有 preview 就没得看，没有 input 就没得改。
// label、control 与三颗按钮由作者按需要挂。
export const editableMeta: ComponentMeta = {
  component: 'editable',
  requiredParts: ['root', 'preview', 'input'],
}
