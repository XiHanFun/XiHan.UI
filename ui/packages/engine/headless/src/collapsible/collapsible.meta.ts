/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 collapsible 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger 可缺省。
export const collapsibleMeta: ComponentMeta = {
  component: 'collapsible',
  requiredParts: ['content'],
}
