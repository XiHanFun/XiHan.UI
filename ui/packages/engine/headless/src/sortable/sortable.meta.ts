/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sortable 相关实现。

import type { ComponentMeta } from '../spec/types'

export const sortableMeta: ComponentMeta = {
  component: 'sortable',
  // item-drag-trigger 不列：不给手柄时整项可拖，是正当形态
  requiredParts: ['root', 'item'],
}
