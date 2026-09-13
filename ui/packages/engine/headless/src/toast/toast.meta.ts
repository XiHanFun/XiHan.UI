/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast 相关实现。

import type { ComponentMeta } from '../spec/types'

// 只有 root 必需：它承载 role/aria-live，缺了这一层读屏不会宣读这一条。
// 其余部件按内容可省。
export const toastMeta: ComponentMeta = {
  component: 'toast',
  requiredParts: ['root'],
}
