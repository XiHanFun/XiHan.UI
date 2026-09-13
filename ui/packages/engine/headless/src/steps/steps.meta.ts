/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 steps 相关实现。

import type { ComponentMeta } from '../spec/types'

// list 承载 tablist 语义与方向键导航，item/trigger 是一步的最小可用形态。
// indicator / title / description / separator / content 全是可选。
export const stepsMeta: ComponentMeta = {
  component: 'steps',
  requiredParts: ['root', 'list', 'item', 'trigger'],
}
