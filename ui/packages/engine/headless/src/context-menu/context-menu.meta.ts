/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context menu 相关实现。

import type { ComponentMeta } from '../spec/types'

// root / positioner / separator / group / arrow 可缺省。
export const contextMenuMeta: ComponentMeta = {
  component: 'context-menu',
  requiredParts: ['trigger', 'content', 'item'],
}
