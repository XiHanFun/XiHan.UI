/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 diff view 相关实现。

import type { ComponentMeta } from '../spec/types'

// root / viewport / body 三者必需；行系按模型铺开，header、gap、empty 与 truncation 按数据取舍。
export const diffViewMeta: ComponentMeta = {
  component: 'diff-view',
  requiredParts: ['root', 'viewport', 'body'],
}
