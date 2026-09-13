/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tooltip 相关实现。

import type { ComponentMeta } from '../spec/types'

// trigger 缺省则无从悬停/聚焦，content 缺省则无描述可读；positioner/arrow 可缺省。
export const tooltipMeta: ComponentMeta = {
  component: 'tooltip',
  requiredParts: ['trigger', 'content'],
}
