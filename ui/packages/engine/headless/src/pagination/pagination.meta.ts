/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pagination 相关实现。

import type { ComponentMeta } from '../spec/types'

// 前后翻页按钮与省略号可缺省。
export const paginationMeta: ComponentMeta = {
  component: 'pagination',
  requiredParts: ['root', 'item'],
}
