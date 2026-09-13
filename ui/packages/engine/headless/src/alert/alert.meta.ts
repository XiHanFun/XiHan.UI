/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 alert 相关实现。

import type { ComponentMeta } from '../spec/types'

// 只有 root 必备：图标、标题、说明、关闭按钮都由作者按需要放。
export const alertMeta: ComponentMeta = {
  component: 'alert',
  requiredParts: ['root'],
}
