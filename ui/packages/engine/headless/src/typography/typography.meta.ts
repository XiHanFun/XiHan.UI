/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 typography 相关实现。

import type { ComponentMeta } from '../spec/types'

export const typographyMeta: ComponentMeta = {
  component: 'typography',
  // 只有根是必备的：标题、段落、行内文字、链接各写各的，数量不限，一个不写也是一块合法的正文
  requiredParts: ['root'],
}
