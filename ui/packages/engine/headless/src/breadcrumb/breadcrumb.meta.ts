/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 breadcrumb 相关实现。

import type { ComponentMeta } from '../spec/types'

export const breadcrumbMeta: ComponentMeta = {
  component: 'breadcrumb',
  requiredParts: ['root', 'list', 'item', 'link'],
}
