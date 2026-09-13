/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menu 相关实现。

import type { ComponentMeta } from '../spec/types'

// positioner/separator/arrow 可缺省。
export const menuMeta: ComponentMeta = {
  component: 'menu',
  requiredParts: ['trigger', 'content', 'item'],
}
