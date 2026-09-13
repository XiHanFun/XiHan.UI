/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 dialog 相关实现。

import type { ComponentMeta } from '../spec/types'

// content 未渲染即违约；title/description 可缺省（缺省时不输出对应 aria 引用）。
export const dialogMeta: ComponentMeta = {
  component: 'dialog',
  requiredParts: ['content'],
}
