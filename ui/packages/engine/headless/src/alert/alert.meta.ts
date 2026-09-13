/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { ComponentMeta } from '../spec/types'

// content 是标题与说明的统一文本列；图标、标题、说明、操作和关闭按钮按需要放。
export const alertMeta: ComponentMeta = {
  component: 'alert',
  requiredParts: ['root', 'content'],
}
