/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 loading bar 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 承载 progressbar 语义与状态属性，range 承载宽度；track 可省。
export const loadingBarMeta: ComponentMeta = {
  component: 'loading-bar',
  requiredParts: ['root', 'range'],
}
