/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast 相关实现。

import type { ComponentMeta } from '../spec/types'

// root 承载实时区语义，content 统一标题与说明的排版；其余部件按内容可省。
export const toastMeta: ComponentMeta = {
  component: 'toast',
  requiredParts: ['root', 'content'],
}
