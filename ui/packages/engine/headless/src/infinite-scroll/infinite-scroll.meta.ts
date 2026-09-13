/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 infinite scroll 相关实现。

import type { ComponentMeta } from '../spec/types'

// 两个都必备：缺了 sentinel 就没有可观察的目标，整套触发无从谈起。
export const infiniteScrollMeta: ComponentMeta = {
  component: 'infinite-scroll',
  requiredParts: ['root', 'sentinel'],
}
