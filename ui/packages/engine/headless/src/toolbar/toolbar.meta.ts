/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 承载 role=toolbar、aria-orientation 与键盘收口，与 item 同为必需。
// group 与 separator 是可选结构。
export const toolbarMeta: ComponentMeta = {
  component: 'toolbar',
  requiredParts: ['root', 'item'],
}
