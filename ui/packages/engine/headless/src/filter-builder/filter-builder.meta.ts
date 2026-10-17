/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 承载 role=group；根组与它的「加条件」是唯一的入口，没有它们就加不了条件。条件行随值出没，不列为必备。
export const filterBuilderMeta: ComponentMeta = {
  component: 'filter-builder',
  requiredParts: ['root', 'group', 'add-condition-trigger'],
}
