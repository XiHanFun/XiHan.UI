/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { ComponentMeta } from '../spec/types'

export const marqueeMeta: ComponentMeta = {
  component: 'marquee',
  // 窗口与轨道是必备的：动画挂在 content 上，缺了它窗口里就是一段不动的内容；暂停开关可选
  requiredParts: ['root', 'content'],
}
