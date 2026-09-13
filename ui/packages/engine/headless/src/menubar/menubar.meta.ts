/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menubar 相关实现。

import type { ComponentMeta } from '../spec/types'

// positioner/separator/group/item-text/item-indicator 可缺省。
export const menubarMeta: ComponentMeta = {
  component: 'menubar',
  requiredParts: ['root', 'trigger', 'content', 'item'],
}
