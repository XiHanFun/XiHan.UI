/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 drawer 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 与 content 必需（root 承载 data-side 样式钩子）。
// backdrop / positioner / title / description 可缺省。
export const drawerMeta: ComponentMeta = {
  component: 'drawer',
  requiredParts: ['root', 'content'],
}
