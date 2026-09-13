/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 page header 相关实现。

import type { ComponentMeta } from '../spec/types'

export const pageHeaderMeta: ComponentMeta = {
  component: 'page-header',
  // 只有根是必备的：返回位、标题、副标题、操作、页脚按需摆，一个不写也是一块合法的页头
  requiredParts: ['root'],
}
